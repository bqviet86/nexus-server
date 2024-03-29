import { Server as ServerHttp } from 'http'
import { Server } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { ObjectId } from 'mongodb'

import { NotificationPostAction, NotificationType } from '~/constants/enums'
import { TokenPayload } from '~/models/requests/User.requests'
import Comment from '~/models/schemas/Comment.schema'
import Post from '~/models/schemas/Post.schema'
import commentService from '~/services/comments.services'
import notificationService from '~/services/notifications.services'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from './commons'
import { delayExecution } from './handlers'

type UserSocket = {
    socket_ids: string[]
    previous_post_ids_news_feed: string[]
    previous_post_ids_profile: string[]
}

export let io: Server
export const socketUsers: Record<string, UserSocket> = {}
export let socketDatingUsers: string[] = []

const initSocket = (httpServer: ServerHttp) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL
        }
    })

    io.use(async (socket, next) => {
        const Authorization = socket.handshake.auth.Authorization as string | undefined
        const access_token = Authorization?.split(' ')[1] || ''

        try {
            const decoded_authorization = await verifyAccessToken(access_token)

            socket.handshake.auth.access_token = access_token
            socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayload

            next()
        } catch (error) {
            const err = new Error('Unauthorized') as ExtendedError

            err.data = error
            next(err)
        }
    })

    const logSocketUsers = () => {
        console.log(
            '------------------------------------\n',
            'socketUsers',
            Object.keys(socketUsers).map((userId) => ({
                user_id: userId,
                ...socketUsers[userId],
                previous_post_ids_news_feed: socketUsers[userId].previous_post_ids_news_feed.length,
                previous_post_ids_profile: socketUsers[userId].previous_post_ids_profile.length,
                in_dating_room: socketDatingUsers.includes(userId)
            }))
        )
    }

    const deleteSocketUser = (user_id: string) => {
        delete socketUsers[user_id]
        socketDatingUsers = socketDatingUsers.filter((id) => id !== user_id)
    }

    const updateDatingRoom = async () => {
        await delayExecution(() => {
            Object.keys(socketUsers)
                .filter((userId) => socketDatingUsers.includes(userId))
                .forEach((userId) => {
                    socketUsers[userId].socket_ids.forEach((socket_id) =>
                        io.to(socket_id).emit('dating_room_updated', socketDatingUsers.length)
                    )
                })
        }, 300)
    }

    io.on('connection', (socket) => {
        const { id: socketId } = socket
        const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload

        if (socketUsers[user_id]) {
            socketUsers[user_id].socket_ids.push(socketId)
        } else {
            socketUsers[user_id] = {
                socket_ids: [socketId],
                previous_post_ids_news_feed: [],
                previous_post_ids_profile: []
            }
        }

        logSocketUsers()

        socket.use(async (_, next) => {
            const access_token = socket.handshake.auth.access_token as string

            try {
                await verifyAccessToken(access_token)
                next()
            } catch (error) {
                next(new Error('Unauthorized'))
            }
        })

        socket.on('error', (error) => {
            if (error && error.message === 'Unauthorized') {
                console.log('error', error)
                socket.disconnect()
            }
        })

        socket.on('disconnect', async (reason) => {
            socketUsers[user_id].socket_ids = socketUsers[user_id].socket_ids.filter((id) => id !== socketId)

            if (reason !== 'client namespace disconnect' && !socketUsers[user_id].socket_ids.length) {
                deleteSocketUser(user_id)
                await updateDatingRoom()
            }

            logSocketUsers()
        })

        socket.on(
            'create_comment',
            async (data: Pick<Comment, 'content' | 'media'> & { post_id: string; parent_id: string | null }) => {
                const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
                const [comment, post] = await Promise.all([
                    commentService.createComment({
                        ...data,
                        user_id
                    }),
                    databaseService.posts.findOne({
                        _id: new ObjectId(data.post_id)
                    })
                ])
                const notification = await notificationService.createNotification({
                    user_from_id: user_id,
                    user_to_id: (post as Post).user_id.toString(),
                    type: NotificationType.Post,
                    action: NotificationPostAction.CommentPost,
                    payload: {
                        post_id: (post as Post)._id
                    }
                })

                await delayExecution(() => {
                    Object.keys(socketUsers).forEach((userId) => {
                        socketUsers[userId].socket_ids.forEach((socket_id) =>
                            io.to(socket_id).emit(NotificationPostAction.CommentPost, { notification, comment })
                        )
                    })
                }, 300)
            }
        )

        socket.on('join_dating_room', async () => {
            socketDatingUsers.push(user_id)
            await updateDatingRoom()
            console.log('join_dating_room', user_id)
            logSocketUsers()
        })

        socket.on('leave_dating_room', async () => {
            socketDatingUsers = socketDatingUsers.filter((id) => id !== user_id)
            await updateDatingRoom()
            console.log('leave_dating_room', user_id)
            logSocketUsers()
        })
    })
}

export default initSocket
