import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'

import { UserRole } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
    CancelFriendRequestReqParams,
    ChangePasswordReqBody,
    GetAllFriendsReqParams,
    GetProfileReqParams,
    LoginReqBody,
    LogoutReqBody,
    RefreshTokenReqBody,
    RegisterReqBody,
    ResponseFriendRequestReqBody,
    ResponseFriendRequestReqParams,
    SendFriendRequestReqParams,
    TokenPayload,
    UpdateMeReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

config()

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    const result = await usersService.register(req.body)

    return res.json({
        message: USERS_MESSAGES.REGISTER_SUCCESS,
        result
    })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
    const { _id, role } = req.user as User
    const result = await usersService.login({ user_id: (_id as ObjectId).toString(), role })

    return res.json({
        message: USERS_MESSAGES.LOGIN_SUCCESS,
        result
    })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
    const { refresh_token } = req.body
    const result = await usersService.logout(refresh_token)

    return res.json(result)
}

export const refreshTokenController = async (
    req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
    res: Response
) => {
    const { user_id, role, exp } = req.decoded_refresh_token as TokenPayload
    const { refresh_token } = req.body
    const result = await usersService.refreshToken({ user_id, role, exp, refresh_token })

    return res.json({
        message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
        result
    })
}

export const getMeController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await usersService.getMe(user_id)

    return res.json({
        message: USERS_MESSAGES.GET_ME_SUCCESS,
        result
    })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { profile_id } = req.params
    const result = await usersService.getProfile(user_id, profile_id)

    return res.json({
        message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
        result
    })
}

export const updateAvatarController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await usersService.updateAvatar(user_id, req)

    return res.json({
        message: USERS_MESSAGES.UPDATE_AVATAR_SUCCESS,
        result
    })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await usersService.updateMe(user_id, req.body)

    return res.json({
        message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
        result
    })
}

export const changePasswordController = async (
    req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { password } = req.body
    const result = await usersService.changePassword(user_id, password)

    return res.json(result)
}

export const sendFriendRequestController = async (req: Request<SendFriendRequestReqParams>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const friend = req.friend
    const { user_to_id } = req.params
    const result = await usersService.sendFriendRequest({ user_from_id: user_id, user_to_id, friend })

    return res.json(result)
}

export const responseFriendRequestController = async (
    req: Request<ResponseFriendRequestReqParams, any, ResponseFriendRequestReqBody>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { user_from_id } = req.params
    const { status } = req.body
    const result = await usersService.responseFriendRequest({ user_from_id, user_to_id: user_id, status })

    return res.json(result)
}

export const cancelFriendRequestController = async (req: Request<CancelFriendRequestReqParams>, res: Response) => {
    const { user_id: user_from_id } = req.decoded_authorization as TokenPayload
    const { user_id: user_to_id } = req.params
    const result = await usersService.cancelFriendRequest(user_from_id, user_to_id)

    return res.json(result)
}

export const getAllFriendRequestsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await usersService.getAllFriendRequests(user_id)

    return res.json({
        message: USERS_MESSAGES.GET_ALL_FRIEND_REQUESTS_SUCCESS,
        result
    })
}

export const getAllFriendSuggestionsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await usersService.getAllFriendSuggestions(user_id)

    return res.json({
        message: USERS_MESSAGES.GET_ALL_FRIEND_SUGGESTIONS_SUCCESS,
        result
    })
}

export const getAllFriendsController = async (req: Request<GetAllFriendsReqParams>, res: Response) => {
    const { user_id } = req.params
    const result = await usersService.getAllFriends(user_id)

    return res.json({
        message: USERS_MESSAGES.GET_FRIENDS_SUCCESS,
        result
    })
}

export const loginAdminController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
    const { _id, role } = req.user as User

    if (role !== UserRole.Admin) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            message: USERS_MESSAGES.USER_NOT_ADMIN
        })
    }

    const result = await usersService.login({ user_id: (_id as ObjectId).toString(), role })

    return res.json({
        message: USERS_MESSAGES.LOGIN_SUCCESS,
        result
    })
}

export const logoutAdminController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
    const { role } = req.decoded_refresh_token as TokenPayload
    const { refresh_token } = req.body

    if (role !== UserRole.Admin) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            message: USERS_MESSAGES.USER_NOT_ADMIN
        })
    }

    const result = await usersService.logout(refresh_token)

    return res.json(result)
}
