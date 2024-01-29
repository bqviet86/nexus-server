import { ParamsDictionary } from 'express-serve-static-core'

import { NotificationTag, NotificationType } from '~/constants/enums'
import { PaginationReqQuery } from './Common.requests'
import { NotificationAction, NotificationPayload } from '../Types'

export interface CreateNotificationBody {
    user_from_id?: string
    user_to_id: string
    type: NotificationType
    action: NotificationAction
    payload: NotificationPayload
}

export interface GetAllNotificationsReqQuery extends PaginationReqQuery {
    tag?: NotificationTag
}

export interface ReadNotificationReqParams extends ParamsDictionary {
    notification_id: string
}
