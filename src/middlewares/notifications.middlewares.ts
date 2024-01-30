import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { NotificationTag } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const tagValues = stringEnumToArray(NotificationTag)

const notificationIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload

            if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                    message: NOTIFICATIONS_MESSAGES.INVALID_NOTIFICATION_ID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const notification = await databaseService.notifications.findOne({
                _id: new ObjectId(value),
                user_to_id: new ObjectId(user_id)
            })

            if (notification === null) {
                throw new ErrorWithStatus({
                    message: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

const isReadSchema: ParamSchema = {
    isBoolean: {
        errorMessage: NOTIFICATIONS_MESSAGES.INVALID_IS_READ_VALUE
    }
}

export const getAllNotificationsValidator = validate(
    checkSchema(
        {
            tag: {
                isIn: {
                    options: [tagValues],
                    errorMessage: NOTIFICATIONS_MESSAGES.INVALID_TAG_VALUE
                },
                optional: true
            }
        },
        ['query']
    )
)

export const updateNotificationValidator = validate(
    checkSchema(
        {
            notification_id: notificationIdSchema,
            is_read: isReadSchema
        },
        ['params', 'body']
    )
)

export const updateAllNotificationValidator = validate(
    checkSchema(
        {
            is_read: isReadSchema
        },
        ['body']
    )
)

export const deleteNotificationValidator = validate(
    checkSchema(
        {
            notification_id: notificationIdSchema
        },
        ['params']
    )
)
