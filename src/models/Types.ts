import { ObjectId } from 'mongodb'

import { MediaTypes, NotificationFriendAction, NotificationPostAction } from '~/constants/enums'

export type Media = {
    url: string
    type: MediaTypes
}

export type NotificationAction = NotificationPostAction | NotificationFriendAction

export type NotificationPostPayload = {
    post_id: ObjectId
}

export type NotificationFriendPayload = {
    friend_id: ObjectId
}

export type NotificationPayload = Partial<NotificationPostPayload & NotificationFriendPayload>
