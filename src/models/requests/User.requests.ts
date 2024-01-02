import { JwtPayload } from 'jsonwebtoken'

import { TokenTypes, Sex, UserRole } from '~/constants/enums'

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
