import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { COMMENTS_MESSAGES } from '~/constants/messages'
import { postIdSchema } from './common.middlewares'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import { isMedia } from '~/utils/check'
import { validate } from '~/utils/validation'

const commentIdCustomFunction = async (value: string, { req }: { req: Request }) => {
    if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
            message: COMMENTS_MESSAGES.INVALID_COMMENT_ID,
            status: HTTP_STATUS.BAD_REQUEST
        })
    }

    const { user_id } = req.decoded_authorization as TokenPayload
    const comment = await databaseService.comments.findOne({
        _id: new ObjectId(value),
        user_id: new ObjectId(user_id)
    })

    if (comment === null) {
        throw new ErrorWithStatus({
            message: COMMENTS_MESSAGES.COMMENT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
        })
    }

    return true
}

export const getCommentsOfPostValidator = validate(
    checkSchema(
        {
            post_id: postIdSchema
        },
        ['params']
    )
)

export const getRepliesOfCommentValidator = validate(
    checkSchema(
        {
            comment_id: {
                trim: true,
                custom: {
                    options: async (value: string) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: COMMENTS_MESSAGES.INVALID_COMMENT_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const comment = await databaseService.comments.findOne({
                            _id: new ObjectId(value),
                            parent_id: null
                        })

                        if (comment === null) {
                            throw new ErrorWithStatus({
                                message: COMMENTS_MESSAGES.COMMENT_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        return true
                    }
                }
            }
        },
        ['params']
    )
)

export const updateCommentValidator = validate(
    checkSchema(
        {
            comment_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        return commentIdCustomFunction(value, { req: req as Request })
                    }
                }
            },
            content: {
                trim: true,
                isString: {
                    errorMessage: COMMENTS_MESSAGES.CONTENT_MUST_BE_A_STRING
                }
            },
            media: {
                custom: {
                    options: (value: any) => {
                        if (value !== null && !isMedia(value)) {
                            throw new ErrorWithStatus({
                                message: COMMENTS_MESSAGES.MEDIA_MUST_BE_A_MEDIA_OBJECT_OR_NULL,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            }
        },
        ['params', 'body']
    )
)

export const deleteCommentValidator = validate(
    checkSchema(
        {
            comment_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        return commentIdCustomFunction(value, { req: req as Request })
                    }
                }
            }
        },
        ['params']
    )
)
