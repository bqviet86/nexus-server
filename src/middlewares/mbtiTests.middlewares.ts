import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'

import { MBTIDimension, MBTIValue } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { MBTI_TEST_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import MBTIQuestion from '~/models/schemas/MBTIQuestion.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const MBTIValues = stringEnumToArray(MBTIValue)

export const updateAnswerMBTITestValidator = validate(
    checkSchema(
        {
            answer: {
                isString: {
                    errorMessage: MBTI_TEST_MESSAGES.ANSWER_MUST_BE_STRING
                },
                isIn: {
                    options: [MBTIValues],
                    errorMessage: MBTI_TEST_MESSAGES.ANSWER_MUST_BE_IN_VALUES
                },
                custom: {
                    options: async (value: MBTIValue, { req }) => {
                        const { dimension } = (req as Request).mbti_question as MBTIQuestion
                        const throwError = () => {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.ANSWER_NOT_MATCH_DIMENSION,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        switch (dimension) {
                            case MBTIDimension.EI: {
                                if (![MBTIValue.E, MBTIValue.I].includes(value)) throwError()
                                break
                            }
                            case MBTIDimension.SN: {
                                if (![MBTIValue.S, MBTIValue.N].includes(value)) throwError()
                                break
                            }
                            case MBTIDimension.TF: {
                                if (![MBTIValue.T, MBTIValue.F].includes(value)) throwError()
                                break
                            }
                            case MBTIDimension.JP: {
                                if (![MBTIValue.J, MBTIValue.P].includes(value)) throwError()
                                break
                            }
                        }

                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const completeMBTITestValidator = async (req: Request, res: Response, next: NextFunction) => {
    const mbti_test = req.mbti_test as MBTITest
    const isTestCompleted = mbti_test.answers.every((mbtiAnswer) => mbtiAnswer.answer !== '')

    if (!isTestCompleted) {
        return next(
            new ErrorWithStatus({
                message: MBTI_TEST_MESSAGES.MBTI_TEST_NOT_COMPLETED,
                status: HTTP_STATUS.BAD_REQUEST
            })
        )
    }

    next()
}
