import { Server as ServerHttp } from 'http'
import { Server } from 'socket.io'
import { ObjectId } from 'mongodb'

import { envConfig } from '~/constants/config'
import { MBTIType, NotificationPostAction, NotificationType } from '~/constants/enums'
import { CRITERIA_PASS_SCORE, CRITERIA_SCORES, MBTI_COMPATIBILITY_SCORES } from '~/constants/scores'
import MBTI_COMPATIBILITY from '~/constants/mbtiCompatibility'
import { TokenPayload } from '~/models/requests/User.requests'
import Comment from '~/models/schemas/Comment.schema'
import Post from '~/models/schemas/Post.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import Notification from '~/models/schemas/Notification.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import DatingCriteria from '~/models/schemas/DatingCriteria.schema'
import DatingCall from '~/models/schemas/DatingCall.schema'
import DatingConversation from '~/models/schemas/DatingConversation.schema'
import commentService from '~/services/comments.services'
import notificationService from '~/services/notifications.services'
import conversationService from '~/services/conversations.services'
import databaseService from '~/services/database.services'
import datingUserService from '~/services/datingUsers.services'
import datingConversationService from '~/services/datingConversations.services'
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
export let socketDatingCallUsers: {
    user_id: string
    calling_user_id: string
    is_calculating: boolean
}[] = []

const initSocket = (httpServer: ServerHttp) => {
    io = new Server(httpServer, {
        cors: {
            origin: envConfig.clientUrl
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
            const err = new Error('Unauthorized') as any

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
                in_dating_room: socketDatingUsers.includes(userId),
                in_call: socketDatingCallUsers.map((userCall) => userCall.user_id).includes(userId)
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
                    if (socketUsers[userId]) {
                        socketUsers[userId].socket_ids.forEach((socket_id) =>
                            io.to(socket_id).emit('dating_room_updated', socketDatingUsers.length)
                        )
                    }
                })
        }, 300)
    }

    const getDatingCallUser = (user_id: string) => {
        const index = socketDatingCallUsers.findIndex((userCall) => userCall.user_id === user_id)
        return index !== -1 ? socketDatingCallUsers[index] : null
    }

    const calculateCriteriaScore = (profile: DatingUser, criteria: DatingCriteria) => {
        let score: number = 0

        if (profile.sex === criteria.sex) {
            score += CRITERIA_SCORES.Sex
        }

        if (profile.age >= criteria.age_range[0] && profile.age <= criteria.age_range[1]) {
            score += CRITERIA_SCORES.Age
        }

        if (profile.height >= criteria.height_range[0] && profile.height <= criteria.height_range[1]) {
            score += CRITERIA_SCORES.Height
        }

        if (profile.hometown === criteria.hometown) {
            score += CRITERIA_SCORES.Hometown
        }

        if (profile.language === criteria.language) {
            score += CRITERIA_SCORES.Language
        }

        return score
    }

    const filterDatingCallUsers = (user_ids: string[]) => {
        socketDatingCallUsers = socketDatingCallUsers.filter((userCall) => !user_ids.includes(userCall.user_id))
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
                let notification: Notification | null = null

                if (user_id !== (post as Post).user_id.toString()) {
                    notification = await notificationService.createNotification({
                        user_from_id: user_id,
                        user_to_id: (post as Post).user_id.toString(),
                        type: NotificationType.Post,
                        action: NotificationPostAction.CommentPost,
                        payload: {
                            post_id: (post as Post)._id
                        }
                    })
                }

                await delayExecution(() => {
                    Object.keys(socketUsers).forEach((userId) => {
                        if (socketUsers[userId]) {
                            socketUsers[userId].socket_ids.forEach((socket_id) =>
                                io.to(socket_id).emit(NotificationPostAction.CommentPost, { notification, comment })
                            )
                        }
                    })
                }, 300)
            }
        )

        socket.on(
            'send_message',
            async ({
                sender_id,
                receiver_id,
                content
            }: {
                sender_id: string
                receiver_id: string
                content: string
            }) => {
                const result = await databaseService.conversations.insertOne(
                    new Conversation({
                        sender_id: new ObjectId(sender_id),
                        receiver_id: new ObjectId(receiver_id),
                        content: content
                    })
                )
                const [conversation] = await databaseService.conversations
                    .aggregate<Conversation>([
                        {
                            $match: {
                                _id: result.insertedId
                            }
                        },
                        ...conversationService.commonAggregateConversations
                    ])
                    .toArray()

                if (socketUsers[sender_id]) {
                    socketUsers[sender_id].socket_ids
                        .concat(socketUsers[receiver_id] ? socketUsers[receiver_id].socket_ids : [])
                        .forEach((socket_id) => io.to(socket_id).emit('receive_message', conversation))
                }
            }
        )

        socket.on('join_dating_room', async () => {
            if (!socketDatingUsers.includes(user_id)) {
                socketDatingUsers.push(user_id)
            }

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

        socket.on('find_call_user', async ({ user_id: my_id }: { user_id: string }) => {
            const userIds = socketDatingCallUsers.map((userCall) => userCall.user_id)

            // If the queue is empty, emit an event to the caller to notify
            if (userIds.length === 0) {
                socket.emit('call_user_queue_empty')
            }

            // Add the user to the queue if the user is not in the queue
            if (!userIds.includes(my_id)) {
                socketDatingCallUsers.push({
                    user_id: my_id,
                    calling_user_id: '',
                    is_calculating: false
                })
            }

            const [[myProfile], [{ criteria: myCriteria }]] = await Promise.all([
                databaseService.datingUsers
                    .aggregate<DatingUser>([
                        {
                            $match: {
                                user_id: new ObjectId(my_id)
                            }
                        },
                        ...datingUserService.commonAggregateDatingUsers(true)
                    ])
                    .toArray(),
                databaseService.datingUsers
                    .aggregate<{ criteria: DatingCriteria }>([
                        {
                            $match: {
                                user_id: new ObjectId(my_id)
                            }
                        },
                        {
                            $lookup: {
                                from: 'dating_criterias',
                                localField: '_id',
                                foreignField: 'dating_user_id',
                                as: 'criteria'
                            }
                        },
                        {
                            $unwind: {
                                path: '$criteria'
                            }
                        },
                        {
                            $project: {
                                criteria: 1
                            }
                        }
                    ])
                    .toArray()
            ])

            let count = 0
            let isMatched = false
            let me = getDatingCallUser(my_id)

            while (count < 3 && !isMatched && me && !me.calling_user_id && !me.is_calculating) {
                isMatched = await delayExecution(async () => {
                    console.log(my_id, 'executing')
                    count++

                    const me = getDatingCallUser(my_id)
                    if (!me) return false
                    me.is_calculating = true

                    const userIds = socketDatingCallUsers
                        .filter(
                            ({ user_id, calling_user_id, is_calculating }) =>
                                user_id !== my_id && !calling_user_id && !is_calculating
                        )
                        .map((userCall) => new ObjectId(userCall.user_id))

                    if (!userIds.length) {
                        const me = getDatingCallUser(my_id)
                        me && (me.is_calculating = false)
                        return false
                    }

                    const [userProfiles, criterias] = await Promise.all([
                        databaseService.datingUsers
                            .aggregate<DatingUser>([
                                {
                                    $match: {
                                        user_id: {
                                            $in: userIds
                                        }
                                    }
                                },
                                ...datingUserService.commonAggregateDatingUsers(true)
                            ])
                            .toArray(),
                        databaseService.datingUsers
                            .aggregate<{ criteria: DatingCriteria }>([
                                {
                                    $match: {
                                        user_id: {
                                            $in: userIds
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'dating_criterias',
                                        localField: '_id',
                                        foreignField: 'dating_user_id',
                                        as: 'criteria'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$criteria'
                                    }
                                },
                                {
                                    $project: {
                                        criteria: 1
                                    }
                                }
                            ])
                            .toArray()
                    ])
                    const userCriterias = criterias.map(({ criteria }) => criteria)
                    const scores: Record<
                        string,
                        { user_score: number; my_score: number; mbti_score: number | null; total_score: number }
                    > = {}

                    console.log('\n------------------------------------------------------------------------\n')

                    console.log(`${myProfile.name} match to ${userProfiles.length} users`)

                    userProfiles.forEach((userProfile, index) => {
                        const user_score = calculateCriteriaScore(userProfile, myCriteria)
                        const my_score = calculateCriteriaScore(myProfile, userCriterias[index])
                        const myMBTIType = (myProfile as any).mbti_type as MBTIType
                        const userMBTIType = (userProfile as any).mbti_type as MBTIType
                        const mbti_score =
                            myMBTIType && userMBTIType
                                ? MBTI_COMPATIBILITY_SCORES[MBTI_COMPATIBILITY[myMBTIType][userMBTIType]]
                                : null

                        scores[userProfile.user_id.toString()] = {
                            user_score,
                            my_score,
                            mbti_score,
                            total_score: user_score + my_score + (mbti_score ?? 0)
                        }

                        console.log(
                            `   + ${myProfile.name} vs ${userProfile.name}:`,
                            scores[userProfile.user_id.toString()]
                        )
                    })

                    console.log('\n------------------------------------------------------------------------\n')

                    const userProfilesMatched = userProfiles.filter((userProfile) => {
                        const userId = userProfile.user_id.toString()

                        if (
                            scores[userId].user_score >= CRITERIA_PASS_SCORE &&
                            scores[userId].my_score >= CRITERIA_PASS_SCORE
                        ) {
                            return true
                        }

                        delete scores[userId]
                        return false
                    })

                    if (!userProfilesMatched.length) {
                        const me = getDatingCallUser(my_id)
                        me && (me.is_calculating = false)
                        return false
                    }

                    // Sort the user profiles by total score
                    userProfilesMatched.sort(
                        (a, b) => scores[b.user_id.toString()].total_score - scores[a.user_id.toString()].total_score
                    )

                    let userToCall: DatingUser | null = null

                    for (const userProfile of userProfilesMatched) {
                        const userId = userProfile.user_id.toString()
                        const me = getDatingCallUser(my_id)
                        const user = getDatingCallUser(userId)

                        if (!me) {
                            return false
                        }

                        if (me.calling_user_id) {
                            break
                        }

                        if (!user || user.calling_user_id || user.is_calculating) {
                            continue
                        }

                        me.calling_user_id = userId
                        me.is_calculating = false
                        user.calling_user_id = my_id
                        user.is_calculating = false
                        userToCall = userProfile

                        if (socketUsers[my_id]) {
                            socketUsers[my_id].socket_ids.forEach((socket_id) =>
                                io.to(socket_id).emit('find_call_user', {
                                    my_profile: myProfile,
                                    user_profile: userProfile
                                })
                            )
                        }
                    }

                    return userToCall ? true : false
                }, 10000)

                me = getDatingCallUser(my_id)
            }

            if (count >= 3 && !isMatched) {
                socket.emit('call_timeout')
                filterDatingCallUsers([my_id])
            }

            console.log('find_call_user', my_id)
            console.log('socketDatingCallUsers', socketDatingCallUsers)
        })

        socket.on(
            'call_user',
            async ({ user_from, user_to, signalData }: { user_from: DatingUser; user_to: string; signalData: any }) => {
                if (socketUsers[user_to]) {
                    socketUsers[user_to].socket_ids.forEach((socket_id) =>
                        io.to(socket_id).emit('call_user', { user_from, signalData })
                    )
                }

                console.log('call_user', user_from.user_id.toString(), user_to)
                console.log('socketDatingCallUsers', socketDatingCallUsers)
            }
        )

        socket.on('call_accepted', async ({ user_to, signalData }: { user_to: string; signalData: any }) => {
            if (socketUsers[user_to]) {
                socketUsers[user_to].socket_ids.forEach((socket_id) =>
                    io.to(socket_id).emit('call_accepted', signalData)
                )
            }

            console.log('call_accepted', user_id, user_to)
            console.log('socketDatingCallUsers', socketDatingCallUsers)
        })

        socket.on('request_constructive_game', (calling_user_id: string) => {
            if (socketUsers[calling_user_id]) {
                socketUsers[calling_user_id].socket_ids.forEach((socket_id) =>
                    io.to(socket_id).emit('request_constructive_game')
                )
            }
        })

        socket.on('reject_constructive_game', (calling_user_id: string) => {
            if (socketUsers[calling_user_id]) {
                socketUsers[calling_user_id].socket_ids.forEach((socket_id) =>
                    io.to(socket_id).emit('reject_constructive_game')
                )
            }
        })

        socket.on(
            'accept_constructive_game',
            ({ calling_user_id, constructive_result }: { calling_user_id: string; constructive_result: any }) => {
                if (socketUsers[calling_user_id]) {
                    socketUsers[calling_user_id].socket_ids.forEach((socket_id) =>
                        io.to(socket_id).emit('accept_constructive_game', constructive_result)
                    )
                }
            }
        )

        socket.on('leave_call', async ({ user_id: my_id }: { user_id: string }) => {
            const me = getDatingCallUser(my_id)

            if (me) {
                const calling_user_id = me.calling_user_id

                filterDatingCallUsers([my_id, ...(calling_user_id ? [calling_user_id] : [])])

                if (socketUsers[my_id]) {
                    socketUsers[my_id].socket_ids
                        .concat(
                            calling_user_id && socketUsers[calling_user_id]
                                ? socketUsers[calling_user_id].socket_ids
                                : []
                        )
                        .forEach((socket_id) => io.to(socket_id).emit('leave_call'))
                }

                console.log('leave_call', my_id, calling_user_id)
                console.log('socketDatingCallUsers', socketDatingCallUsers)
            }
        })

        socket.on('end_call', async ({ user_id: my_id }: { user_id: string }) => {
            const me = getDatingCallUser(my_id)

            if (me) {
                const calling_user_id = me.calling_user_id

                filterDatingCallUsers([my_id, ...(calling_user_id ? [calling_user_id] : [])])

                if (socketUsers[my_id]) {
                    socketUsers[my_id].socket_ids
                        .concat(
                            calling_user_id && socketUsers[calling_user_id]
                                ? socketUsers[calling_user_id].socket_ids
                                : []
                        )
                        .forEach((socket_id) => io.to(socket_id).emit('end_call'))
                }

                console.log('end_call', my_id, calling_user_id)
                console.log('socketDatingCallUsers', socketDatingCallUsers)
            }
        })

        socket.on(
            'create_dating_call',
            ({ my_id, user_id, dating_call }: { my_id: string; user_id: string; dating_call: DatingCall }) => {
                if (socketUsers[my_id]) {
                    socketUsers[my_id].socket_ids
                        .concat(socketUsers[user_id] ? socketUsers[user_id].socket_ids : [])
                        .forEach((socket_id) => io.to(socket_id).emit('create_dating_call', dating_call))
                }
            }
        )

        socket.on(
            'dating_send_message',
            async ({
                sender_id,
                receiver_id,
                content
            }: {
                sender_id: string
                receiver_id: string
                content: string
            }) => {
                const result = await databaseService.datingConversations.insertOne(
                    new DatingConversation({
                        sender_id: new ObjectId(sender_id),
                        receiver_id: new ObjectId(receiver_id),
                        content: content
                    })
                )
                const [[conversation], { user_id: my_id }, { user_id }] = await Promise.all([
                    databaseService.datingConversations
                        .aggregate<DatingConversation>([
                            {
                                $match: {
                                    _id: result.insertedId
                                }
                            },
                            ...datingConversationService.commonAggregateDatingConversations
                        ])
                        .toArray(),
                    databaseService.datingUsers.findOne({
                        _id: new ObjectId(sender_id)
                    }) as Promise<DatingUser>,
                    databaseService.datingUsers.findOne({
                        _id: new ObjectId(receiver_id)
                    }) as Promise<DatingUser>
                ])

                if (socketUsers[my_id.toString()]) {
                    socketUsers[my_id.toString()].socket_ids
                        .concat(socketUsers[user_id.toString()] ? socketUsers[user_id.toString()].socket_ids : [])
                        .forEach((socket_id) => io.to(socket_id).emit('dating_receive_message', conversation))
                }
            }
        )
    })
}

export default initSocket
