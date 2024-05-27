import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParamSchema, checkSchema } from 'express-validator'
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
import postService from '~/services/posts.services'
import { isMedia } from '~/utils/check'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const postTypeValues = stringEnumToArray(PostType)

const postIdSchema: ParamSchema = {
    isString: true,
    custom: {
        options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.INVALID_POST_ID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const { user_id } = req.decoded_authorization as TokenPayload
            const post = await databaseService.posts.findOne({
                _id: new ObjectId(value)
            })

            if (post === null) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.POST_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            if (post.user_id.toString() !== user_id) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.NOT_HAVE_PERMISSION,
                    status: HTTP_STATUS.FORBIDDEN
                })
            }

            return true
        }
    }
}

const contentSchema: ParamSchema = {
    isString: true,
    custom: {
        options: (value: string, { req }) => {
            const { medias, type } = req.body as CreatePostReqBody

            // Nếu type là share thì content không được rỗng khi không có media
            if (type === PostType.Post && isEmpty(value) && isEmpty(medias)) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.CONTENT_MUST_NOT_BE_EMPTY,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            return true
        }
    }
}

const hashTagsSchema: ParamSchema = {
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
}

const mediaSchema: ParamSchema = {
    isArray: true,
    custom: {
        options: (value: any[], { req }) => {
            const { type } = req.body as CreatePostReqBody

            if (type === PostType.Post && value.some((media) => !isMedia(media))) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            if (type === PostType.Share && !isEmpty(value)) {
                throw new ErrorWithStatus({
                    message: POSTS_MESSAGES.MEDIAS_MUST_BE_EMPTY,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            return true
        }
    }
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
            content: contentSchema,
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

                            if (parentPost.type === PostType.Share) {
                                throw new ErrorWithStatus({
                                    message: POSTS_MESSAGES.PARENT_POST_NOT_BE_SHARE_POST,
                                    status: HTTP_STATUS.BAD_REQUEST
                                })
                            }

                            ;(req as Request).parent_post = parentPost
                        }

                        // parent_id phải là null nếu type là post gốc
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
            hashtags: hashTagsSchema,
            medias: mediaSchema
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

export const getProfilePostsValidator = validate(
    checkSchema(
        {
            profile_id: {
                isString: true,
                custom: {
                    options: async (value) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.INVALID_PROFILE_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(value)
                        })

                        if (user === null) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.PROFILE_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }
                    }
                }
            }
        },
        ['params']
    )
)

export const getPostValidator = validate(
    checkSchema(
        {
            post_id: {
                isString: true,
                custom: {
                    options: async (value, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: POSTS_MESSAGES.INVALID_POST_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const { user_id } = req.decoded_authorization as TokenPayload
                        const [result] = await databaseService.posts
                            .aggregate<{ post: Post }>([
                                {
                                    $match: {
                                        _id: new ObjectId(value)
                                    }
                                },
                                ...postService.commonAggregatePosts(user_id)
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

                        return true
                    }
                }
            }
        },
        ['params']
    )
)

export const updatePostValidator = validate(
    checkSchema(
        {
            post_id: postIdSchema,
            content: contentSchema,
            hashtags: hashTagsSchema,
            medias: mediaSchema
        },
        ['body', 'params']
    )
)

export const deletePostValidator = validate(
    checkSchema(
        {
            post_id: postIdSchema
        },
        ['params']
    )
)
