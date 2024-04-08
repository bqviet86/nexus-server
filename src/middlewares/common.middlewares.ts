import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { pick } from 'lodash'

import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES, CONSTRUCTIVE_RESULTS_MESSAGES, MBTI_TEST_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'
import ConstructiveResult from '~/models/schemas/ConstructiveResult.schema'
import databaseService from '~/services/database.services'
import mbtiTestService from '~/services/mbtiTests.services'
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

export const checkDatingProfileExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const datingProfile = await databaseService.datingUsers.findOne({
        user_id: new ObjectId(user_id)
    })

    if (datingProfile === null) {
        return next(
            new ErrorWithStatus({
                message: COMMON_MESSAGES.DATING_PROFILE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            })
        )
    }

    ;(req as Request).dating_profile = datingProfile

    next()
}

export const MBTITestIdValidator = validate(
    checkSchema(
        {
            mbti_test_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.INVALID_MBTI_TEST_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const dating_profile = (req as Request).dating_profile as DatingUser
                        const [mbtiTest] = await databaseService.mbtiTests
                            .aggregate<MBTITest>(
                                mbtiTestService.commonAggregateMBTITest({
                                    mbti_test_id: value,
                                    dating_profile_id: (dating_profile._id as ObjectId).toString()
                                })
                            )
                            .toArray()

                        if (mbtiTest === undefined) {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.MBTI_TEST_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).mbti_test = mbtiTest

                        return true
                    }
                }
            }
        },
        ['params']
    )
)

export const questionIdMBTITestValidator = validate(
    checkSchema(
        {
            question_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.QUESTION_ID_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const mbtiQuestion = await databaseService.mbtiQuestions.findOne({
                            _id: new ObjectId(value)
                        })

                        if (mbtiQuestion === null) {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.QUESTION_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        const mbti_test = (req as Request).mbti_test as MBTITest
                        const isQuestionExist = mbti_test.answers.some(
                            (answer) => (answer as any).question._id.toString() === value
                        )

                        if (!isQuestionExist) {
                            throw new ErrorWithStatus({
                                message: MBTI_TEST_MESSAGES.QUESTION_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).mbti_question = mbtiQuestion

                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const constructiveResultIdValidator = validate(
    checkSchema(
        {
            constructive_result_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.INVALID_CONSTRUCTIVE_RESULT_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const constructiveResult = await databaseService.constructiveResults.findOne({
                            _id: new ObjectId(value)
                        })

                        if (constructiveResult === null) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.CONSTRUCTIVE_RESULT_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).constructive_result = constructiveResult

                        return true
                    }
                }
            }
        },
        ['params']
    )
)

export const questionIdConstructiveResultValidator = validate(
    checkSchema(
        {
            question_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.QUESTION_ID_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const constructiveQuestion = await databaseService.constructiveQuestions.findOne({
                            _id: new ObjectId(value)
                        })

                        if (constructiveQuestion === null) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.QUESTION_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        const constructive_result = (req as Request).constructive_result as ConstructiveResult
                        const isQuestionExist = constructive_result.first_user.answers.some(
                            (answer) => answer.question_id.toString() === value
                        )

                        if (!isQuestionExist) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.QUESTION_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).constructive_question = constructiveQuestion

                        return true
                    }
                }
            }
        },
        ['body']
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
