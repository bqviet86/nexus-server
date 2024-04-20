import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const questionSchema: ParamSchema = {
    in: ['body'],
    isString: {
        errorMessage: 'Question must be a string'
    },
    isLength: {
        errorMessage: 'Question must be at least 1 character long',
        options: { min: 1 }
    }
}

const optionsSchema: ParamSchema = {
    in: ['body'],
    isArray: {
        errorMessage: 'Options must be an array'
    },
    custom: {
        options: (options: any) => {
            if (options.length < 2) {
                throw new ErrorWithStatus({
                    message: 'Options must have at least 2 elements',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            if (options.length > 6) {
                throw new ErrorWithStatus({
                    message: 'Options must have at most 6 elements',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            options.forEach((option: any) => {
                if (typeof option !== 'string') {
                    throw new ErrorWithStatus({
                        message: 'Options must be string array',
                        status: HTTP_STATUS.BAD_REQUEST
                    })
                }
            })

            return true
        }
    }
}

const constructiveQuestionIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: any) => {
            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: 'Invalid constructive question id',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const constructiveQuestion = await databaseService.constructiveQuestions.findOne({
                _id: new ObjectId(value)
            })

            if (constructiveQuestion === null) {
                throw new ErrorWithStatus({
                    message: 'Constructive question not found',
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

export const getAllConstructiveQuestionsValidator = validate(
    checkSchema(
        {
            question: {
                in: ['query'],
                isString: {
                    errorMessage: 'Question must be a string'
                },
                optional: true
            }
        },
        ['query']
    )
)

export const createConstructiveQuestionValidator = validate(
    checkSchema(
        {
            question: questionSchema,
            options: optionsSchema
        },
        ['body']
    )
)

export const updateConstructiveQuestionValidator = validate(
    checkSchema(
        {
            constructive_question_id: constructiveQuestionIdSchema,
            question: {
                ...questionSchema,
                optional: true
            },
            options: {
                ...optionsSchema,
                optional: true
            }
        },
        ['params', 'body']
    )
)

export const deleteConstructiveQuestionValidator = validate(
    checkSchema(
        {
            constructive_question_id: constructiveQuestionIdSchema
        },
        ['params']
    )
)
