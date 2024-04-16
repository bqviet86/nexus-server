import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { DATING_CALL_MESSAGES } from '~/constants/messages'
import { CreateDatingCallReqBody, GetAllDatingCallsReqQuery } from '~/models/requests/DatingCall.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import datingCallService from '~/services/datingCalls.services'

export const createDatingCallController = async (
    req: Request<ParamsDictionary, any, CreateDatingCallReqBody>,
    res: Response
) => {
    const result = await datingCallService.createDatingCall(req.body)

    return res.json({
        message: DATING_CALL_MESSAGES.DATING_CALL_CREATED_SUCCESSFULLY,
        result
    })
}

export const getAllDatingCallsController = async (
    req: Request<ParamsDictionary, any, any, GetAllDatingCallsReqQuery>,
    res: Response
) => {
    const { dating_profile_id } = req.query
    const dating_profile = req.dating_profile as DatingUser
    const result = await datingCallService.getAllDatingCalls({
        user_dating_profile_id: dating_profile_id,
        dating_profile
    })

    return res.json({
        message: DATING_CALL_MESSAGES.GET_ALL_DATING_CALLS_SUCCESSFULLY,
        result
    })
}
