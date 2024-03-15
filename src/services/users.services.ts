import { Request } from 'express'
import path from 'path'
import fsPromise from 'fs/promises'
import { Document, ObjectId, WithId } from 'mongodb'
import { config } from 'dotenv'

import { FriendStatus, NotificationFriendAction, NotificationType, TokenTypes, UserRole } from '~/constants/enums'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Friend from '~/models/schemas/Friend.schema'
import databaseService from './database.services'
import mediaService from './medias.services'
import notificationService from './notifications.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { io, socketUsers } from '~/utils/socket'
import { delayExecution } from '~/utils/handlers'

config()

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
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN
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
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
            })
        }

        return signToken({
            payload: {
                user_id,
                role,
                token_type: TokenTypes.RefreshToken
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN
            }
        })
    }

    private signAccessTokenAndRefreshToken({ user_id, role }: { user_id: string; role: UserRole }) {
        return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
    }

    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
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

    async updateAvatar(user_id: string, req: Request) {
        // Xoá avatar cũ
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        const avatar = user && user.avatar

        if (avatar) {
            const avatar_path = path.resolve(UPLOAD_IMAGE_DIR, avatar)

            await fsPromise.unlink(avatar_path)
        }

        // Lưu avatar mới
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

    async sendFriendRequest(user_from_id: string, user_to_id: string) {
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
}

const userService = new UserService()

export default userService
