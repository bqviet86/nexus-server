import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { CONSTRUCTIVE_RESULTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateConstructiveResultReqBody } from '~/models/requests/ConstructiveResult.requests'
import ConstructiveQuestion from '~/models/schemas/ConstructiveQuestion.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import databaseService from '~/services/database.services'
import datingUserService from '~/services/datingUsers.services'
import { validate } from '~/utils/validation'

const datingUserIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: CONSTRUCTIVE_RESULTS_MESSAGES.DATING_USER_ID_INVALID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const { first_user_id, second_user_id } = req.body as CreateConstructiveResultReqBody
            const dating_profile_id = ((req as Request).dating_profile as DatingUser)._id as ObjectId

            if (![first_user_id, second_user_id].includes(dating_profile_id.toString())) {
                throw new ErrorWithStatus({
                    message: CONSTRUCTIVE_RESULTS_MESSAGES.NOT_ALLOWED_TO_CREATE_RESULT,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            const [datingProfile] = await databaseService.datingUsers
                .aggregate<DatingUser>([
                    {
                        $match: {
                            _id: new ObjectId(value)
                        }
                    },
                    ...datingUserService.commonAggregateDatingUsers()
                ])
                .toArray()

            if (datingProfile === undefined) {
                throw new ErrorWithStatus({
                    message: CONSTRUCTIVE_RESULTS_MESSAGES.DATING_USER_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

export const createConstructiveResultValidator = validate(
    checkSchema(
        {
            first_user_id: datingUserIdSchema,
            second_user_id: datingUserIdSchema
        },
        ['body']
    )
)

export const getConstructiveResultValidator = validate(
    checkSchema(
        {
            dating_call_id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.DATING_CALL_ID_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const datingCall = await databaseService.datingCalls.findOne({
                            _id: new ObjectId(value)
                        })

                        if (datingCall === null) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.DATING_CALL_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        const { first_user_id, second_user_id } = datingCall
                        const dating_profile_id = ((req as Request).dating_profile as DatingUser)._id as ObjectId

                        if (!first_user_id.equals(dating_profile_id) && !second_user_id.equals(dating_profile_id)) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.NOT_ALLOWED_TO_GET_RESULT,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).dating_call = datingCall

                        return true
                    }
                }
            }
        },
        ['params']
    )
)

export const updateAnswerConstructiveResultValidator = validate(
    checkSchema(
        {
            answer: {
                isString: {
                    errorMessage: CONSTRUCTIVE_RESULTS_MESSAGES.ANSWER_MUST_BE_STRING
                },
                custom: {
                    options: async (value: string, { req }) => {
                        const options = ((req as Request).constructive_question as ConstructiveQuestion).options

                        if (!options.includes(value)) {
                            throw new ErrorWithStatus({
                                message: CONSTRUCTIVE_RESULTS_MESSAGES.INVALID_ANSWER_OPTION,
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
