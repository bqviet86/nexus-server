import { NotificationType } from '~/constants/enums'

export interface CreateNotificationBody {
    user_from_id?: string
    user_to_id: string
    post_id: string
    type: NotificationType
}
