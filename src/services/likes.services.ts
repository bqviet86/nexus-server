import { ObjectId } from 'mongodb'

import { LIKES_MESSAGES } from '~/constants/messages'
import { NotificationPostAction, NotificationType } from '~/constants/enums'
import Like from '~/models/schemas/Like.schema'
import Post from '~/models/schemas/Post.schema'
import databaseService from './database.services'
import notificationService from './notifications.services'
import { io, socketUsers } from '~/utils/socket'
import { delayExecution } from '~/utils/handlers'

class LikeService {
    async likePost({ user_id, post_id, post }: { user_id: string; post_id: string; post: Post }) {
        await databaseService.likes.insertOne(
            new Like({
                user_id: new ObjectId(user_id),
                post_id: new ObjectId(post_id)
            })
        )

        const user_to_id = post.user_id.toString()
        const notification = await notificationService.createNotification({
            user_from_id: user_id,
            user_to_id,
            type: NotificationType.Post,
            action: NotificationPostAction.LikePost,
            payload: {
                post_id: post._id
            }
        })

        await delayExecution(() => {
            Object.keys(socketUsers).forEach((userId) => {
                socketUsers[userId].socket_ids.forEach((socket_id) => {
                    io.to(socket_id).emit(NotificationPostAction.LikePost, { notification, user_id, post_id })
                })
            })
        }, 300)

        return { message: LIKES_MESSAGES.LIKE_POST_SUCCESSFULLY }
    }

    async unlikePost({ user_id, post_id }: { user_id: string; post_id: string }) {
        await Promise.all([
            databaseService.likes.deleteOne({
                user_id: new ObjectId(user_id),
                post_id: new ObjectId(post_id)
            }),
            delayExecution(() => {
                Object.keys(socketUsers).forEach((userId) => {
                    socketUsers[userId].socket_ids.forEach((socket_id) => {
                        io.to(socket_id).emit('unlike_post', { user_id, post_id })
                    })
                })
            }, 300)
        ])

        return { message: LIKES_MESSAGES.UNLIKE_POST_SUCCESSFULLY }
    }
}

const likeService = new LikeService()

export default likeService
