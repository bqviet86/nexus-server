import { ObjectId } from 'mongodb'

import { MBTIValue, MediaTypes, NotificationFriendAction, NotificationPostAction } from '~/constants/enums'

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

export type MBTIOption = {
    option: string
    dimension_value: MBTIValue
}

export type MBTIAnswer = {
    question_id: ObjectId
    answer: MBTIValue | ''
}

export type ConstructiveAnswer = {
    question_id: ObjectId
    answer: string
}

export type ConstructiveUserAnswer = {
    id: ObjectId
    answers: ConstructiveAnswer[]
}
