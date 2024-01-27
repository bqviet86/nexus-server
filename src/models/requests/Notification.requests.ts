import { NotificationTag, NotificationType } from '~/constants/enums'
import { PaginationReqQuery } from './common.requests'

export interface CreateNotificationBody {
    user_from_id?: string
    user_to_id: string
    post_id: string
    type: NotificationType
}

export interface GetAllNotificationsReqQuery extends PaginationReqQuery {
    tag?: NotificationTag
}
