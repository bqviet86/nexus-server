import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { pick } from 'lodash'

import { validate } from '~/utils/validation'

type FilterKeys<T> = Array<keyof T>

// Middlewares
export const filterMiddleware =
    <T>(filterKeys: FilterKeys<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        req.body = pick(req.body, filterKeys)
        next()
    }

// Schemas
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
