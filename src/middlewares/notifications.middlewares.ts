import { checkSchema } from 'express-validator'

import { NotificationTag } from '~/constants/enums'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const tagValues = stringEnumToArray(NotificationTag)

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
