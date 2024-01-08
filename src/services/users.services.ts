import { Request } from 'express'
import path from 'path'
import fsPromise from 'fs/promises'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'

import { TokenTypes, UserRole } from '~/constants/enums'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from './database.services'
import mediaService from './medias.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'

config()

class UserService {
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
}

const userService = new UserService()

export default userService
