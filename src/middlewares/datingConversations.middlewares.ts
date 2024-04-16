import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { DATING_CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const getDatingConversationValidator = validate(
    checkSchema(
        {
            receiver_id: {
                trim: true,
                custom: {
                    options: async (value: string) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: DATING_CONVERSATIONS_MESSAGES.INVALID_RECEIVER_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const dating_profile = await databaseService.datingUsers.findOne({
                            _id: new ObjectId(value)
                        })

                        if (dating_profile === null) {
                            throw new ErrorWithStatus({
                                message: DATING_CONVERSATIONS_MESSAGES.RECEIVER_NOT_FOUND,
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
