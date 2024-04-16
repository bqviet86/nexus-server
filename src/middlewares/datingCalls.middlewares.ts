import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { DATING_CALL_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { CreateDatingCallReqBody } from '~/models/requests/DatingCall.requests'
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
                    message: DATING_CALL_MESSAGES.DATING_USER_ID_INVALID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const { first_user_id, second_user_id } = req.body as CreateDatingCallReqBody
            const dating_profile_id = ((req as Request).dating_profile as DatingUser)._id as ObjectId

            if (![first_user_id, second_user_id].includes(dating_profile_id.toString())) {
                throw new ErrorWithStatus({
                    message: DATING_CALL_MESSAGES.NOT_ALLOWED_TO_CREATE_CALL,
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
                    message: DATING_CALL_MESSAGES.DATING_USER_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

export const createDatingCallValidator = validate(
    checkSchema(
        {
            first_user_id: datingUserIdSchema,
            second_user_id: datingUserIdSchema,
            constructive_result_id: {
                trim: true,
                optional: true,
                custom: {
                    options: (value?: string) => {
                        if (value && !ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: DATING_CALL_MESSAGES.CONSTRUCTIVE_RESULT_ID_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        return true
                    }
                }
            },
            duration: {
                isInt: {
                    options: {
                        min: 1
                    },
                    errorMessage: DATING_CALL_MESSAGES.DURATION_IS_INVALID
                }
            }
        },
        ['body']
    )
)

export const getAllDatingCallsValidator = validate(
    checkSchema(
        {
            dating_profile_id: {
                trim: true,
                optional: true,
                custom: {
                    options: async (value: string) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: DATING_CALL_MESSAGES.DATING_USER_ID_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const datingProfile = await databaseService.datingUsers.findOne({
                            _id: new ObjectId(value)
                        })

                        if (datingProfile === null) {
                            throw new ErrorWithStatus({
                                message: DATING_CALL_MESSAGES.DATING_USER_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        return true
                    }
                }
            }
        },
        ['query']
    )
)
