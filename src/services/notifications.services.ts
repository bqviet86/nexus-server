import { ObjectId } from 'mongodb'

import { CreateNotificationBody } from '~/models/requests/Notification.requests'
import Notification from '~/models/schemas/Notification.schema'
import databaseService from './database.services'

class NotificationService {
    async createNotification(payload: CreateNotificationBody) {
        const insertResult = await databaseService.notifications.insertOne(
            new Notification({
                ...payload,
                user_from_id: payload.user_from_id ? new ObjectId(payload.user_from_id) : undefined,
                user_to_id: new ObjectId(payload.user_to_id),
                post_id: new ObjectId(payload.post_id)
            })
        )
        const [result] = await databaseService.notifications
            .aggregate<{ notification: Notification }>([
                {
                    $match: {
                        _id: insertResult.insertedId
                    }
                },
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
                    $lookup: {
                        from: 'posts',
                        localField: 'post_id',
                        foreignField: '_id',
                        as: 'post'
                    }
                },
                {
                    $unwind: {
                        path: '$post'
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
                        notification: {
                            $concatArrays: ['$withUserFrom', '$withoutUserFrom']
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
                        notification: {
                            user_from_id: 0,
                            user_to_id: 0,
                            post_id: 0,
                            user_from: {
                                password: 0,
                                role: 0
                            },
                            user_to: {
                                password: 0,
                                role: 0
                            }
                        }
                    }
                }
            ])
            .toArray()

        return result.notification
    }
}

const notificationService = new NotificationService()

export default notificationService
