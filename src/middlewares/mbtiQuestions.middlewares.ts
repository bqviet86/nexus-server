import { ParamSchema, check, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { MBTIDimension, MBTIValue } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { MBTIOption } from '~/models/Types'
import { UpdateMBTIQuestionReqBody } from '~/models/requests/MBTIQuestion.requests'
import databaseService from '~/services/database.services'
import { isMBTIOption } from '~/utils/check'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const mbtiDimensionValues = stringEnumToArray(MBTIDimension)

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

const dimensionSchema: ParamSchema = {
    in: ['body'],
    isIn: {
        options: [mbtiDimensionValues],
        errorMessage: `Dimension must be one of: ${mbtiDimensionValues.join(', ')}`
    },
    custom: {
        options: (value: any, { req }) => {
            const { options } = req.body as UpdateMBTIQuestionReqBody

            if (options === undefined) {
                throw new ErrorWithStatus({
                    message: 'Options must be provided',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            return true
        }
    }
}

const optionsSchema: ParamSchema = {
    in: ['body'],
    isArray: {
        errorMessage: 'Options must be an array'
    },
    custom: {
        options: (value: any, { req }) => {
            if (value.length !== 2) {
                throw new ErrorWithStatus({
                    message: 'Options must have exactly 2 elements',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            if (!value.every(isMBTIOption)) {
                throw new ErrorWithStatus({
                    message: 'Options must be an array of MBTI option',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const { dimension } = req.body as UpdateMBTIQuestionReqBody

            if (dimension === undefined) {
                throw new ErrorWithStatus({
                    message: 'dimension must be provided',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const throwError = () => {
                throw new ErrorWithStatus({
                    message: 'dimension_value must match dimension',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            switch (dimension) {
                case MBTIDimension.EI: {
                    if (
                        !value.every((option: MBTIOption) =>
                            [MBTIValue.E, MBTIValue.I].includes(option.dimension_value)
                        ) ||
                        value[0].dimension_value === value[1].dimension_value
                    ) {
                        throwError()
                    }
                    break
                }
                case MBTIDimension.SN: {
                    if (
                        !value.every((option: MBTIOption) =>
                            [MBTIValue.S, MBTIValue.N].includes(option.dimension_value)
                        ) ||
                        value[0].dimension_value === value[1].dimension_value
                    ) {
                        throwError()
                    }
                    break
                }
                case MBTIDimension.TF: {
                    if (
                        !value.every((option: MBTIOption) =>
                            [MBTIValue.T, MBTIValue.F].includes(option.dimension_value)
                        ) ||
                        value[0].dimension_value === value[1].dimension_value
                    ) {
                        throwError()
                    }
                    break
                }
                case MBTIDimension.JP: {
                    if (
                        !value.every((option: MBTIOption) =>
                            [MBTIValue.J, MBTIValue.P].includes(option.dimension_value)
                        ) ||
                        value[0].dimension_value === value[1].dimension_value
                    ) {
                        throwError()
                    }
                    break
                }
            }

            return true
        }
    }
}

const mbtiQuestionIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: any) => {
            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: 'Invalid MBTI question ID',
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const mbtiQuestion = await databaseService.mbtiQuestions.findOne({
                _id: new ObjectId(value)
            })

            if (mbtiQuestion === null) {
                throw new ErrorWithStatus({
                    message: 'MBTI question not found',
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

export const getAllMBTIQuestionsValidator = validate(
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

export const createMBTIQuestionValidator = validate(
    checkSchema(
        {
            question: questionSchema,
            dimension: dimensionSchema,
            options: optionsSchema
        },
        ['body']
    )
)

export const updateMBTIQuestionValidator = validate(
    checkSchema(
        {
            mbti_question_id: mbtiQuestionIdSchema,
            question: {
                ...questionSchema,
                optional: true
            },
            dimension: {
                ...dimensionSchema,
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

export const deleteMBTIQuestionValidator = validate(
    checkSchema(
        {
            mbti_question_id: mbtiQuestionIdSchema
        },
        ['params']
    )
)
