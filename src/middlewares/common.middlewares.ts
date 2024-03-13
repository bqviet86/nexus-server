import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { pick } from 'lodash'

import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

type FilterKeys<T> = Array<keyof T>

// Middlewares
export const filterMiddleware =
    <T>(filterKeys: FilterKeys<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        req.body = pick(req.body, filterKeys)
        next()
    }

export const paginationValidator = validate(
    checkSchema(
        {
            page: {
                notEmpty: {
                    errorMessage: 'Page không được để trống'
                },
                isNumeric: {
                    errorMessage: 'Page phải là một số'
                },
                custom: {
                    options: async (value: number) => {
                        const page = Number(value)

                        if (page < 1) {
                            throw new Error('page >= 1')
                        }

                        return true
                    }
                }
            },
            limit: {
                notEmpty: {
                    errorMessage: 'Limit không được để trống'
                },
                isNumeric: {
                    errorMessage: 'Limit phải là một số'
                },
                custom: {
                    options: async (value: number) => {
                        const limit = Number(value)

                        if (limit < 5 || limit > 100) {
                            throw new Error('5 <= limit <= 100')
                        }

                        return true
                    }
                }
            }
        },
        ['query']
    )
)

// Schemas
export const postIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: COMMON_MESSAGES.INVALID_POST_ID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const post = await databaseService.posts.findOne({
                _id: new ObjectId(value)
            })

            if (post === null) {
                throw new ErrorWithStatus({
                    message: COMMON_MESSAGES.POST_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            ;(req as Request).post = post

            return true
        }
    }
}
