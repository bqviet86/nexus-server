import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { DATING_USERS_MESSAGES } from '~/constants/messages'
import {
    CreateDatingProfileReqBody,
    GetDatingProfileReqParams,
    UpdateDatingProfileReqBody
} from '~/models/requests/DatingUser.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import datingUserService from '~/services/datingUsers.services'

export const getDatingProfileController = async (req: Request<GetDatingProfileReqParams>, res: Response) => {
    const dating_profile = req.dating_profile || null

    return res.json({
        message: DATING_USERS_MESSAGES.GET_DATING_PROFILE_SUCCESSFULLY,
        result: dating_profile
    })
}

export const createDatingProfileController = async (
    req: Request<ParamsDictionary, any, CreateDatingProfileReqBody>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await datingUserService.createDatingProfile({ user_id, payload: req.body })

    return res.json({
        message: DATING_USERS_MESSAGES.CREATE_DATING_PROFILE_SUCCESSFULLY,
        result
    })
}

export const updateDatingProfileController = async (
    req: Request<ParamsDictionary, any, UpdateDatingProfileReqBody>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await datingUserService.updateDatingProfile({ user_id, payload: req.body })

    return res.json({
        message: DATING_USERS_MESSAGES.UPDATE_DATING_PROFILE_SUCCESSFULLY,
        result
    })
}
