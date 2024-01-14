import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema } from 'express-validator'
import { Request as RequestValidator } from 'express-validator/src/base'
import { ObjectId } from 'mongodb'
import { isArray, isEmpty } from 'lodash'

import { PostType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { POSTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreatePostReqBody } from '~/models/requests/Post.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Post from '~/models/schemas/Post.schema'
import databaseService from '~/services/database.services'
import { isMedia } from '~/utils/check'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const postTypeValues = stringEnumToArray(PostType)

const postIdCustomFunc = async ({
    value,
    req,
    isDeletePost = false
}: {
    value: any
    req: RequestValidator
    isDeletePost?: boolean
}) => {
    if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
            message: POSTS_MESSAGES.INVALID_POST_ID,
            status: HTTP_STATUS.BAD_REQUEST
        })
    }

    const [result] = await databaseService.posts
        .aggregate<{ post: Post }>([
            {
                $match: {
                    _id: new ObjectId(value)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user'
                }
            },
            {
                $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                }
            },
            {
                $facet: {
                    withParent: [
                        {
                            $match: {
                                parent_id: {
                                    $ne: null
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: 'parent_id',
                                foreignField: '_id',
                                as: 'parent_post'
                            }
                        },
                        {
                            $unwind: {
                                path: '$parent_post'
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'parent_post.user_id',
                                foreignField: '_id',
                                as: 'parent_post.user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$parent_post.user'
                            }
                        },
                        {
                            $lookup: {
                                from: 'hashtags',
                                localField: 'parent_post.hashtags',
                                foreignField: '_id',
                                as: 'parent_post.hashtags'
                            }
                        }
                    ],
                    withoutParent: [
                        {
                            $match: {
                                parent_id: null
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    post: {
                        $concatArrays: ['$withParent', '$withoutParent']
                    }
                }
            },
            {
                $unwind: {
                    path: '$post'
                }
            },
            {
                $project: {
                    post: {
                        user_id: 0,
                        parent_id: 0,
                        user: {
                            password: 0,
                            role: 0
                        },
                        parent_post: {
                            user_id: 0,
                            parent_id: 0,
                            user: {
                                password: 0,
                                role: 0
                            }
                        }
                    }
                }
            }
        ])
        .toArray()
    const post = result?.post

    if (post === undefined) {
        throw new ErrorWithStatus({
            message: POSTS_MESSAGES.POST_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
        })
    }

    ;(req as Request).post = post

    if (isDeletePost) {
        const { user_id } = req.decoded_authorization as TokenPayload

        if (!((post as any).user._id as ObjectId).equals(user_id)) {
            throw new ErrorWithStatus({
                message: POSTS_MESSAGES.CAN_NOT_DELETE_POST_OF_OTHER_USER,
                status: HTTP_STATUS.FORBIDDEN
            })
        }
    }

    return true
}

export const createPostValidator = validate(
    checkSchema(
        {
            type: {
                isIn: {
                    options: [postTypeValues],
                    errorMessage: POSTS_MESSAGES.INVALID_TYPE
                }
            },
            content: {
                isString: true,
                custom: {
                    options: (value: string, { req }) => {
                        const medias = (req.body as CreatePostReqBody).medias

                        // content không được rỗng nếu không có media
                        if (isEmpty(value) && isEmpty(medias)) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.CONTENT_MUST_NOT_BE_EMPTY,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            },
            parent_id: {
                custom: {
                    options: async (value, { req }) => {
                        const type = (req.body as CreatePostReqBody).type

                        if (type === PostType.Share) {
                            if (!ObjectId.isValid(value)) {
                                throw new ErrorWithStatus({
                                    message: POSTS_MESSAGES.INVALID_PARENT_ID,
                                    status: HTTP_STATUS.BAD_REQUEST
                                })
                            }

                            const parentPost = await databaseService.posts.findOne({
                                _id: new ObjectId(value)
                            })

                            if (parentPost === null) {
                                throw new ErrorWithStatus({
                                    message: POSTS_MESSAGES.PARENT_POST_NOT_FOUND,
                                    status: HTTP_STATUS.NOT_FOUND
                                })
                            }
                        }

                        // parent_id chỉ được null khi type là post gốc
                        if (type === PostType.Post && value !== null) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.PARENT_ID_MUST_BE_NULL,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            },
            hashtags: {
                isArray: true,
                custom: {
                    options: (value: any[]) => {
                        // hashtags phải là mảng các string
                        if (value.some((hashtag) => typeof hashtag !== 'string')) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            },
            medias: {
                isArray: true,
                custom: {
                    options: (value: string[]) => {
                        // medias phải là mảng các Media
                        if (value.some((media) => !isMedia(media))) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const toLowerCaseHashTags = (
    req: Request<ParamsDictionary, any, CreatePostReqBody>,
    res: Response,
    next: NextFunction
) => {
    const hashtags = req.body.hashtags

    if (isArray(hashtags)) {
        req.body.hashtags = hashtags.map((hashtag) => hashtag.toLowerCase())
    }

    next()
}

export const getPostValidator = validate(
    checkSchema(
        {
            post_id: {
                isString: true,
                custom: {
                    options: (value, { req }) => postIdCustomFunc({ value, req })
                }
            }
        },
        ['params']
    )
)

export const deletePostValidator = validate(
    checkSchema(
        {
            post_id: {
                isString: true,
                custom: {
                    options: (value, { req }) => postIdCustomFunc({ value, req, isDeletePost: true })
                }
            }
        },
        ['params']
    )
)
