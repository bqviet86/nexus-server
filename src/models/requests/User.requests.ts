import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'

import { TokenTypes, Sex, UserRole, FriendStatus } from '~/constants/enums'
import { PaginationReqQuery } from './Common.requests'

export interface RegisterReqBody {
    name: string
    email: string
    password: string
    confirm_password: string
    date_of_birth: string
    sex: Sex
    phone_number: string
}

export interface LoginReqBody {
    email: string
    password: string
}

export interface LogoutReqBody {
    refresh_token: string
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    role: UserRole
    token_type: TokenTypes
    iat: number
    exp: number
}

export interface RefreshTokenReqBody {
    refresh_token: string
}

export interface GetProfileReqParams extends ParamsDictionary {
    profile_id: string
}

export interface UpdateMeReqBody {
    name?: string
    email?: string
    date_of_birth?: string
    sex?: Sex
    phone_number?: string
}

export interface ChangePasswordReqBody {
    old_password: string
    password: string
    confirm_password: string
}

export interface SendFriendRequestReqParams extends ParamsDictionary {
    user_to_id: string
}

export interface ResponseFriendRequestReqParams extends ParamsDictionary {
    user_from_id: string
}

export interface ResponseFriendRequestReqBody {
    status: FriendStatus
}

export interface CancelFriendRequestReqParams extends ParamsDictionary {
    user_id: string
}

export interface GetAllFriendsReqParams extends ParamsDictionary {
    user_id: string
}

export interface GetAllUsersReqQuery extends PaginationReqQuery {
    name?: string
    is_active?: 'true' | 'false'
}

export interface UpdateIsActiveReqParams extends ParamsDictionary {
    user_id: string
}

export interface UpdateIsActiveReqBody {
    is_active: boolean
}
