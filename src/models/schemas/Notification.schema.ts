import { ObjectId } from 'mongodb'

import { NotificationType } from '~/constants/enums'
import { NotificationAction, NotificationPayload } from '../Types'

interface NotificationConstructor {
    _id?: ObjectId
    user_from_id?: ObjectId
    user_to_id: ObjectId
    type: NotificationType
    action: NotificationAction
    payload: NotificationPayload
    is_read?: boolean
    created_at?: Date
    updated_at?: Date
}

export default class Notification {
    _id?: ObjectId
    user_from_id: ObjectId | null
    user_to_id: ObjectId
    type: NotificationType
    action: NotificationAction
    payload: NotificationPayload
    is_read: boolean
    created_at: Date
    updated_at: Date

    constructor(notification: NotificationConstructor) {
        const date = new Date()

        this._id = notification._id
        this.user_from_id = notification.user_from_id || null
        this.user_to_id = notification.user_to_id
        this.type = notification.type
        this.action = notification.action
        this.payload = notification.payload
        this.is_read = notification.is_read || false
        this.created_at = notification.created_at || date
        this.updated_at = notification.updated_at || date
    }
}
