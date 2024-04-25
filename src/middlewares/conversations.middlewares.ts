import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const getConversationValidator = validate(
    checkSchema(
        {
            receiver_id: {
                trim: true,
                custom: {
                    options: async (value: string) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: CONVERSATIONS_MESSAGES.INVALID_RECEIVER_ID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(value)
                        })

                        if (user === null) {
                            throw new ErrorWithStatus({
                                message: CONVERSATIONS_MESSAGES.RECEIVER_NOT_FOUND,
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
