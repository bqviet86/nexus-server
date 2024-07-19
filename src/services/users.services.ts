import { Request } from 'express'
import { Document, ObjectId, WithId } from 'mongodb'
import { countBy, flatMap } from 'lodash'

import {
    FriendStatus,
    MBTITestStatus,
    MediaTypes,
    NotificationFriendAction,
    NotificationType,
    TokenTypes,
    UserRole
} from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { envConfig } from '~/constants/config'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Friend from '~/models/schemas/Friend.schema'
import databaseService from './database.services'
import mediaService from './medias.services'
import notificationService from './notifications.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { io, socketDatingCallUsers, socketUsers } from '~/utils/socket'
import { delayExecution } from '~/utils/handlers'

class UserService {
    private commonAggregateFriends: Document[] = [
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
            $project: {
                user_from: {
                    password: 0
                },
                user_to: {
                    password: 0
                }
            }
        }
    ]

    private signAccessToken({ user_id, role }: { user_id: string; role?: UserRole }) {
        return signToken({
            payload: {
                user_id,
                role,
                token_type: TokenTypes.AccessToken
            },
            privateKey: envConfig.jwtSecretAccessToken,
            options: {
                expiresIn: envConfig.accessTokenExpireIn
            }
        })
    }

    private signRefreshToken({ user_id, role, exp }: { user_id: string; role: UserRole; exp?: number }) {
        if (exp) {
            return signToken({
                payload: {
                    user_id,
                    role,
                    token_type: TokenTypes.RefreshToken,
                    exp
                },
                privateKey: envConfig.jwtSecretRefreshToken
            })
        }

        return signToken({
            payload: {
                user_id,
                role,
                token_type: TokenTypes.RefreshToken
            },
            privateKey: envConfig.jwtSecretRefreshToken,
            options: {
                expiresIn: envConfig.refreshTokenExpireIn
            }
        })
    }

    private signAccessTokenAndRefreshToken({ user_id, role }: { user_id: string; role: UserRole }) {
        return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
    }

    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublicKey: envConfig.jwtSecretRefreshToken
        })
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })

        return Boolean(user)
    }

    async checkUsernameExist(username: string) {
        const user = await databaseService.users.findOne({ username })

        return Boolean(user)
    }

    async register(payload: RegisterReqBody) {
        const user_id = new ObjectId()
        const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
            user_id: user_id.toString(),
            role: UserRole.User
        })
        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        const [insertUserResult] = await Promise.all([
            databaseService.users.insertOne(
                new User({
                    ...payload,
                    _id: user_id,
                    password: hashPassword(payload.password),
                    date_of_birth: new Date(payload.date_of_birth)
                })
            ),
            databaseService.refreshTokens.insertOne(
                new RefreshToken({
                    token: refresh_token,
                    user_id,
                    iat,
                    exp
                })
            )
        ])
        const user = await databaseService.users.findOne(
            { _id: insertUserResult.insertedId },
            {
                projection: {
                    password: 0
                }
            }
        )

        return {
            user,
            token: { access_token, refresh_token }
        }
    }

    async login({ user_id, role }: { user_id: string; role: UserRole }) {
        const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, role })
        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        const [user] = await Promise.all([
            databaseService.users.findOne(
                { _id: new ObjectId(user_id) },
                {
                    projection: {
                        password: 0
                    }
                }
            ),
            databaseService.refreshTokens.insertOne(
                new RefreshToken({
                    token: refresh_token,
                    user_id: new ObjectId(user_id),
                    iat,
                    exp
                })
            )
        ])

        return {
            user,
            token: { access_token, refresh_token }
        }
    }

    async logout(refresh_token: string) {
        await databaseService.refreshTokens.deleteOne({ token: refresh_token })

        return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
    }

    async refreshToken({
        user_id,
        role,
        exp,
        refresh_token
    }: {
        user_id: string
        role: UserRole
        exp: number
        refresh_token: string
    }) {
        const [new_access_token, new_refresh_token, _] = await Promise.all([
            this.signAccessToken({ user_id, role }),
            this.signRefreshToken({ user_id, role, exp }),
            databaseService.refreshTokens.deleteOne({ token: refresh_token })
        ])
        const decode_new_refresh_token = await this.decodeRefreshToken(new_refresh_token)

        await databaseService.refreshTokens.insertOne(
            new RefreshToken({
                token: new_refresh_token,
                user_id: new ObjectId(user_id),
                iat: decode_new_refresh_token.iat,
                exp: decode_new_refresh_token.exp
            })
        )

        return {
            access_token: new_access_token,
            refresh_token: new_refresh_token
        }
    }

    async getMe(user_id: string) {
        const user = await databaseService.users.findOne(
            { _id: new ObjectId(user_id) },
            {
                projection: {
                    password: 0
                }
            }
        )

        return user
    }

    async getProfile(user_id: string, profile_id: string) {
        const [user] = await databaseService.users
            .aggregate<User>([
                {
                    $match: {
                        _id: new ObjectId(profile_id)
                    }
                },
                {
                    $lookup: {
                        from: 'friends',
                        localField: '_id',
                        foreignField: 'user_from_id',
                        as: 'friends_one'
                    }
                },
                {
                    $lookup: {
                        from: 'friends',
                        localField: '_id',
                        foreignField: 'user_to_id',
                        as: 'friends_two'
                    }
                },
                {
                    $addFields: {
                        friends_send: {
                            $filter: {
                                input: '$friends_two',
                                as: 'friend',
                                cond: {
                                    $eq: ['$$friend.status', FriendStatus.Pending]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_receive: {
                            $filter: {
                                input: '$friends_one',
                                as: 'friend',
                                cond: {
                                    $eq: ['$$friend.status', FriendStatus.Pending]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_decline: {
                            $filter: {
                                input: '$friends_two',
                                as: 'friend',
                                cond: {
                                    $eq: ['$$friend.status', FriendStatus.Declined]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        is_sending: {
                            $in: [
                                new ObjectId(user_id),
                                {
                                    $map: {
                                        input: '$friends_send',
                                        as: 'friend',
                                        in: '$$friend.user_from_id'
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        is_receiving: {
                            $in: [
                                new ObjectId(user_id),
                                {
                                    $map: {
                                        input: '$friends_receive',
                                        as: 'friend',
                                        in: '$$friend.user_to_id'
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        is_declined: {
                            $in: [
                                new ObjectId(user_id),
                                {
                                    $map: {
                                        input: '$friends_decline',
                                        as: 'friend',
                                        in: '$$friend.user_from_id'
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        friends_one: {
                            $filter: {
                                input: '$friends_one',
                                as: 'friend',
                                cond: {
                                    $eq: ['$$friend.status', FriendStatus.Accepted]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_two: {
                            $filter: {
                                input: '$friends_two',
                                as: 'friend',
                                cond: {
                                    $eq: ['$$friend.status', FriendStatus.Accepted]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_one: {
                            $map: {
                                input: '$friends_one',
                                as: 'friend',
                                in: '$$friend.user_to_id'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_two: {
                            $map: {
                                input: '$friends_two',
                                as: 'friend',
                                in: '$$friend.user_from_id'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends: {
                            $concatArrays: ['$friends_one', '$friends_two']
                        }
                    }
                },
                {
                    $addFields: {
                        friend_count: {
                            $size: '$friends'
                        }
                    }
                },
                {
                    $addFields: {
                        is_friend: {
                            $in: [new ObjectId(user_id), '$friends']
                        }
                    }
                },
                {
                    $addFields: {
                        friends: {
                            $slice: ['$friends', 8]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'friends',
                        foreignField: '_id',
                        as: 'friends'
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'posts'
                    }
                },
                {
                    $unwind: {
                        path: '$posts',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: {
                        'posts.created_at': -1
                    }
                },
                {
                    $addFields: {
                        images: '$posts.medias'
                    }
                },
                {
                    $addFields: {
                        images: {
                            $filter: {
                                input: '$images',
                                as: 'image',
                                cond: {
                                    $eq: ['$$image.type', MediaTypes.Image]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$images',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: new ObjectId(profile_id),
                        name: { $first: '$name' },
                        email: { $first: '$email' },
                        date_of_birth: { $first: '$date_of_birth' },
                        sex: { $first: '$sex' },
                        phone_number: { $first: '$phone_number' },
                        role: { $first: '$role' },
                        avatar: { $first: '$avatar' },
                        created_at: { $first: '$created_at' },
                        updated_at: { $first: '$updated_at' },
                        friends: { $first: '$friends' },
                        friend_count: { $first: '$friend_count' },
                        is_friend: { $first: '$is_friend' },
                        is_sending: { $first: '$is_sending' },
                        is_receiving: { $first: '$is_receiving' },
                        is_declined: { $first: '$is_declined' },
                        images: { $push: '$images' }
                    }
                },
                {
                    $addFields: {
                        images: {
                            $filter: {
                                input: '$images',
                                as: 'image',
                                cond: {
                                    $ne: ['$$image', null]
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        friends: {
                            password: 0
                        }
                    }
                }
            ])
            .toArray()

        return user
    }

    async updateAvatar(user_id: string, req: Request) {
        const [media] = await mediaService.uploadImage({
            req,
            maxFiles: 1, // 1 file
            maxFileSize: 5 * 1024 * 1024 // 5mb
        })
        const new_avatar = media.url.split('/').slice(-1)[0]

        await databaseService.users.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    avatar: new_avatar
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        return media
    }

    async updateMe(user_id: string, payload: UpdateMeReqBody) {
        const { name, email, date_of_birth, sex, phone_number } = payload
        const user = await databaseService.users.findOneAndUpdate(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    ...(name ? { name } : {}),
                    ...(email ? { email } : {}),
                    ...(date_of_birth ? { date_of_birth: new Date(date_of_birth) } : {}),
                    ...(sex ? { sex } : {}),
                    ...(phone_number ? { phone_number } : {})
                },
                $currentDate: {
                    updated_at: true
                }
            },
            {
                returnDocument: 'after',
                includeResultMetadata: false,
                projection: {
                    password: 0
                }
            }
        )

        return user
    }

    async changePassword(user_id: string, new_password: string) {
        await databaseService.users.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    password: hashPassword(new_password)
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        return { message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS }
    }

    async sendFriendRequest({
        user_from_id,
        user_to_id,
        friend
    }: {
        user_from_id: string
        user_to_id: string
        friend?: Friend
    }) {
        if (friend) {
            await databaseService.friends.deleteOne({
                _id: friend._id as ObjectId
            })
        }

        const result = await databaseService.friends.insertOne(
            new Friend({
                user_from_id: new ObjectId(user_from_id),
                user_to_id: new ObjectId(user_to_id)
            })
        )
        const notification = await notificationService.createNotification({
            user_from_id,
            user_to_id,
            type: NotificationType.Friend,
            action: NotificationFriendAction.SendFriendRequest,
            payload: {
                friend_id: result.insertedId
            }
        })

        await delayExecution(() => {
            if (socketUsers[user_to_id]) {
                socketUsers[user_to_id].socket_ids.forEach((socket_id) => {
                    io.to(socket_id).emit(NotificationFriendAction.SendFriendRequest, { notification })
                })
            }
        }, 300)

        return { message: USERS_MESSAGES.SEND_FRIEND_REQUEST_SUCCESS }
    }

    async responseFriendRequest({
        user_from_id,
        user_to_id,
        status
    }: {
        user_from_id: string
        user_to_id: string
        status: FriendStatus
    }) {
        const friend = (await databaseService.friends.findOneAndUpdate(
            {
                user_from_id: new ObjectId(user_from_id),
                user_to_id: new ObjectId(user_to_id)
            },
            {
                $set: {
                    status
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )) as WithId<Friend>

        if (status === FriendStatus.Accepted) {
            const notification = await notificationService.createNotification({
                user_from_id: user_to_id,
                user_to_id: user_from_id,
                type: NotificationType.Friend,
                action: NotificationFriendAction.AcceptFriendRequest,
                payload: {
                    friend_id: friend._id
                }
            })

            await delayExecution(() => {
                if (socketUsers[user_from_id]) {
                    socketUsers[user_from_id].socket_ids.forEach((socket_id) => {
                        io.to(socket_id).emit(NotificationFriendAction.AcceptFriendRequest, { notification })
                    })
                }
            }, 300)
        }

        return { message: USERS_MESSAGES.RESPONSE_FRIEND_REQUEST_SUCCESS }
    }

    async cancelFriendRequest(user_from_id: string, user_to_id: string) {
        await Promise.all([
            databaseService.friends.deleteOne({
                user_from_id: new ObjectId(user_from_id),
                user_to_id: new ObjectId(user_to_id)
            }),
            databaseService.notifications.deleteOne({
                user_from_id: new ObjectId(user_from_id),
                user_to_id: new ObjectId(user_to_id),
                type: NotificationType.Friend,
                action: NotificationFriendAction.SendFriendRequest
            })
        ])

        return { message: USERS_MESSAGES.CANCEL_FRIEND_REQUEST_SUCCESS }
    }

    async getAllFriendRequests(user_id: string) {
        const friends = await databaseService.friends
            .aggregate<Friend>([
                {
                    $match: {
                        user_to_id: new ObjectId(user_id),
                        status: FriendStatus.Pending
                    }
                },
                ...this.commonAggregateFriends,
                {
                    $sort: {
                        created_at: -1
                    }
                }
            ])
            .toArray()

        return friends
    }

    async getAllFriendSuggestions(user_id: string) {
        const users = await databaseService.users
            .aggregate<User>([
                {
                    $match: {
                        _id: {
                            $ne: new ObjectId(user_id)
                        },
                        role: UserRole.User
                    }
                },
                {
                    $lookup: {
                        from: 'friends',
                        localField: '_id',
                        foreignField: 'user_from_id',
                        as: 'friends_one'
                    }
                },
                {
                    $lookup: {
                        from: 'friends',
                        localField: '_id',
                        foreignField: 'user_to_id',
                        as: 'friends_two'
                    }
                },
                {
                    $addFields: {
                        friends_one: {
                            $map: {
                                input: '$friends_one',
                                as: 'friend',
                                in: '$$friend.user_to_id'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends_two: {
                            $map: {
                                input: '$friends_two',
                                as: 'friend',
                                in: '$$friend.user_from_id'
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        friends: {
                            $concatArrays: ['$friends_one', '$friends_two']
                        }
                    }
                },
                {
                    $match: {
                        friends: {
                            $nin: [new ObjectId(user_id)]
                        }
                    }
                },
                {
                    $sample: {
                        size: 10
                    }
                },
                {
                    $project: {
                        password: 0,
                        friends_one: 0,
                        friends_two: 0,
                        friends: 0
                    }
                }
            ])
            .toArray()

        return users
    }

    async getAllFriends(user_id: string) {
        const friends = (
            await databaseService.friends
                .aggregate<{ friend: User }>([
                    {
                        $facet: {
                            friends_one: [
                                {
                                    $match: {
                                        user_from_id: new ObjectId(user_id),
                                        status: FriendStatus.Accepted
                                    }
                                }
                            ],
                            friends_two: [
                                {
                                    $match: {
                                        user_to_id: new ObjectId(user_id),
                                        status: FriendStatus.Accepted
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            friends_one: {
                                $map: {
                                    input: '$friends_one',
                                    as: 'friend',
                                    in: '$$friend.user_to_id'
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            friends_two: {
                                $map: {
                                    input: '$friends_two',
                                    as: 'friend',
                                    in: '$$friend.user_from_id'
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            friend: {
                                $concatArrays: ['$friends_one', '$friends_two']
                            }
                        }
                    },
                    {
                        $unwind: {
                            path: '$friend'
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'friend',
                            foreignField: '_id',
                            as: 'friend'
                        }
                    },
                    {
                        $unwind: {
                            path: '$friend'
                        }
                    },
                    {
                        $project: {
                            friend: {
                                password: 0
                            }
                        }
                    }
                ])
                .toArray()
        ).map(({ friend }) => friend)

        return friends
    }

    async getAllStats() {
        const onl_amount = Object.keys(socketUsers).length
        const calling_amount = socketDatingCallUsers.filter((user) => user.calling_user_id).length

        const [posts_amount, [{ avg_start_rating }], mbti_types, constructive_questions, review_texts] =
            await Promise.all([
                databaseService.posts.countDocuments(),
                databaseService.datingReviews
                    .aggregate<{ avg_start_rating: number }>([
                        {
                            $match: {}
                        },
                        {
                            $group: {
                                _id: null,
                                avg_start_rating: {
                                    $avg: '$stars_rating'
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0
                            }
                        }
                    ])
                    .toArray(),
                databaseService.mbtiTests
                    .find({
                        status: MBTITestStatus.Completed
                    })
                    .toArray(),
                databaseService.constructiveResults
                    .aggregate<{ questions: string[] }>([
                        {
                            $match: {}
                        },
                        {
                            $project: {
                                questions: {
                                    $map: {
                                        input: '$first_user.answers',
                                        as: 'answer',
                                        in: '$$answer.question_id'
                                    }
                                }
                            }
                        }
                    ])
                    .toArray(),
                databaseService.datingReviews.find().toArray()
            ])

        const top_mbti_types = Object.entries(countBy(mbti_types, 'mbti_type'))
            .map(([mbti_type, amount]) => ({ mbti_type, amount }))
            .sort((a, b) => b.amount - a.amount)
            .filter((_, index) => index < 5)

        const top_constructive_questions = (
            await Promise.all(
                Object.entries(countBy(flatMap(constructive_questions, (item) => item.questions))).map(
                    async ([question_id, amount]) => {
                        const question = await databaseService.constructiveQuestions.findOne({
                            _id: new ObjectId(question_id)
                        })

                        return { ...question, amount }
                    }
                )
            )
        )
            .sort((a, b) => b.amount - a.amount)
            .filter((_, index) => index < 5)

        const top_review_texts = Object.entries(countBy(flatMap(review_texts.map(({ review_texts }) => review_texts))))
            .map(([review_text, amount]) => ({ review_text, amount }))
            .sort((a, b) => b.amount - a.amount)
            .filter((_, index) => index < 5)

        return {
            onl_amount,
            posts_amount,
            calling_amount,
            avg_start_rating: avg_start_rating ? avg_start_rating.toFixed(2) : 0,
            top_mbti_types,
            top_constructive_questions,
            top_review_texts
        }
    }

    async getAllUsers({
        name,
        is_active,
        page,
        limit
    }: {
        name?: string
        is_active?: boolean
        page: number
        limit: number
    }) {
        const [{ users, total_users }] = await databaseService.users
            .aggregate<{
                users: User[]
                total_users: number
            }>([
                {
                    $match: {
                        role: UserRole.User,
                        ...(name ? { name: new RegExp(name, 'i') } : {}),
                        ...(is_active !== undefined ? { is_active } : {})
                    }
                },
                {
                    $facet: {
                        users: [
                            {
                                $skip: limit * (page - 1)
                            },
                            {
                                $limit: limit
                            },
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ],
                        total: [
                            {
                                $count: 'total_users'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$total',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        users: '$users',
                        total_users: '$total.total_users'
                    }
                }
            ])
            .toArray()

        return {
            users: users || [],
            total_users: total_users || 0
        }
    }

    async updateIsActive(user_id: string, is_active: boolean) {
        await databaseService.users.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    is_active
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        return { message: USERS_MESSAGES.UPDATE_IS_ACTIVE_SUCCESS }
    }
}

const userService = new UserService()

export default userService
