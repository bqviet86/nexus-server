import { Document, ObjectId } from 'mongodb'

import { NotificationTag, NotificationType } from '~/constants/enums'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { CreateNotificationBody } from '~/models/requests/Notification.requests'
import Notification from '~/models/schemas/Notification.schema'
import databaseService from './database.services'

class NotificationService {
    private commonAggregateNotifications: Document[] = [
        {
            $lookup: {
                from: 'users',
                localField: 'user_to_id',
                foreignField: '_id',
                as: 'user_to'
            }
        },
        {
            $unwind: {
                path: '$user_to'
            }
        },
        {
            $facet: {
                withUserFrom: [
                    {
                        $match: {
                            user_from_id: {
                                $ne: null
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_from_id',
                            foreignField: '_id',
                            as: 'user_from'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user_from'
                        }
                    }
                ],
                withoutUserFrom: [
                    {
                        $match: {
                            user_from_id: null
                        }
                    },
                    {
                        $addFields: {
                            user_from: null
                        }
                    }
                ]
            }
        },
        {
            $project: {
                result: {
                    $concatArrays: ['$withUserFrom', '$withoutUserFrom']
                }
            }
        },
        {
            $unwind: {
                path: '$result'
            }
        },
        {
            $facet: {
                typeIsPost: [
                    {
                        $match: {
                            'result.type': NotificationType.Post
                        }
                    },
                    {
                        $lookup: {
                            from: 'posts',
                            localField: 'result.payload.post_id',
                            foreignField: '_id',
                            as: 'result.payload.post'
                        }
                    },
                    {
                        $unwind: {
                            path: '$result.payload.post'
                        }
                    }
                ],
                typeIsFriend: [
                    {
                        $match: {
                            'result.type': NotificationType.Friend
                        }
                    },
                    {
                        $lookup: {
                            from: 'friends',
                            localField: 'result.payload.friend_id',
                            foreignField: '_id',
                            as: 'result.payload.friend'
                        }
                    },
                    {
                        $unwind: {
                            path: '$result.payload.friend'
                        }
                    }
                ]
            }
        },
        {
            $project: {
                notification: {
                    $concatArrays: ['$typeIsPost', '$typeIsFriend']
                }
            }
        },
        {
            $unwind: {
                path: '$notification'
            }
        },
        {
            $project: {
                notification: '$notification.result'
            }
        },
        {
            $project: {
                notification: {
                    user_from_id: 0,
                    user_to_id: 0,
                    user_from: {
                        password: 0
                    },
                    user_to: {
                        password: 0
                    },
                    payload: {
                        post_id: 0,
                        friend_id: 0
                    }
                }
            }
        }
    ]

    async createNotification(body: CreateNotificationBody) {
        const { user_from_id, user_to_id, type, action, payload } = body
        let notificationId: ObjectId

        const notification = await databaseService.notifications.findOne({
            ...(user_from_id ? { user_from_id: new ObjectId(user_from_id) } : {}),
            user_to_id: new ObjectId(user_to_id),
            type,
            action,
            ...(payload.post_id ? { 'payload.post_id': new ObjectId(payload.post_id) } : {}),
            ...(payload.friend_id ? { 'payload.friend_id': new ObjectId(payload.friend_id) } : {})
        })

        if (notification) {
            notificationId = notification._id
        } else {
            const { insertedId } = await databaseService.notifications.insertOne(
                new Notification({
                    ...body,
                    user_from_id: user_from_id ? new ObjectId(user_from_id) : undefined,
                    user_to_id: new ObjectId(user_to_id)
                })
            )
            notificationId = insertedId
        }

        const [result] = await databaseService.notifications
            .aggregate<{ notification: Notification }>([
                {
                    $match: {
                        _id: notificationId
                    }
                },
                ...this.commonAggregateNotifications
            ])
            .toArray()

        return result.notification
    }

    async getAllNotifications({
        user_id,
        page,
        limit,
        tag
    }: {
        user_id: string
        page: number
        limit: number
        tag?: NotificationTag
    }) {
        const $match = {
            user_to_id: new ObjectId(user_id),
            ...(tag === NotificationTag.Read
                ? { is_read: true }
                : tag === NotificationTag.Unread
                  ? { is_read: false }
                  : {})
        }
        const [result, total_notifications] = await Promise.all([
            databaseService.notifications
                .aggregate<{ notification: Notification }>([
                    {
                        $match
                    },
                    ...this.commonAggregateNotifications,
                    {
                        $sort: {
                            'notification.created_at': -1
                        }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ])
                .toArray(),
            databaseService.notifications.countDocuments($match)
        ])
        const notifications = result.map((item) => item.notification)

        return {
            notifications,
            total_notifications
        }
    }

    async getUnreadNotifications(user_id: string) {
        const $match = {
            user_to_id: new ObjectId(user_id),
            is_read: false
        }
        const [result, total_unread] = await Promise.all([
            databaseService.notifications
                .aggregate<{ notification: Notification }>([
                    {
                        $match
                    },
                    ...this.commonAggregateNotifications,
                    {
                        $sort: {
                            'notification.created_at': -1
                        }
                    }
                ])
                .toArray(),
            databaseService.notifications.countDocuments($match)
        ])
        const notifications = result.map((item) => item.notification)

        return {
            notifications,
            total_unread
        }
    }

    async updateNotification({
        notification_id,
        user_id,
        is_read
    }: {
        notification_id: string
        user_id: string
        is_read: boolean
    }) {
        await databaseService.notifications.updateOne(
            {
                _id: new ObjectId(notification_id),
                user_to_id: new ObjectId(user_id)
            },
            {
                $set: {
                    is_read
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        return { message: NOTIFICATIONS_MESSAGES.UPDATE_NOTIFICATION_SUCCESSFULLY }
    }

    async updateAllNotification({ user_id, is_read }: { user_id: string; is_read: boolean }) {
        await databaseService.notifications.updateMany(
            {
                user_to_id: new ObjectId(user_id)
            },
            {
                $set: {
                    is_read
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        return { message: NOTIFICATIONS_MESSAGES.UPDATE_ALL_NOTIFICATIONS_SUCCESSFULLY }
    }

    async deleteNotification({ notification_id, user_id }: { notification_id: string; user_id: string }) {
        await databaseService.notifications.deleteOne({
            _id: new ObjectId(notification_id),
            user_to_id: new ObjectId(user_id)
        })

        return { message: NOTIFICATIONS_MESSAGES.DELETE_NOTIFICATION_SUCCESSFULLY }
    }
}

const notificationService = new NotificationService()

export default notificationService
