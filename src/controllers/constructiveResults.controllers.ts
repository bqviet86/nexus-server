import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CONSTRUCTIVE_RESULTS_MESSAGES } from '~/constants/messages'
import {
    CreateConstructiveResultReqBody,
    GetConstructiveResultReqParams,
    UpdateAnswerConstructiveResultReqBody,
    UpdateAnswerConstructiveResultReqParams
} from '~/models/requests/ConstructiveResult.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import ConstructiveResult from '~/models/schemas/ConstructiveResult.schema'
import DatingCall from '~/models/schemas/DatingCall.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import constructiveResultService from '~/services/constructiveResults.services'
import databaseService from '~/services/database.services'

export const createConstructiveResultController = async (
    req: Request<ParamsDictionary, any, CreateConstructiveResultReqBody>,
    res: Response
) => {
    const result = await constructiveResultService.createConstructiveResult(req.body)

    return res.json({
        message: CONSTRUCTIVE_RESULTS_MESSAGES.CONSTRUCTIVE_RESULT_CREATED_SUCCESSFULLY,
        result
    })
}

export const getConstructiveResultController = async (req: Request<GetConstructiveResultReqParams>, res: Response) => {
    const { constructive_result_id } = req.dating_call as DatingCall
    const result = constructive_result_id
        ? await constructiveResultService.getConstructiveResult(constructive_result_id.toString())
        : null

    return res.json({
        message: CONSTRUCTIVE_RESULTS_MESSAGES.GET_CONSTRUCTIVE_RESULT_SUCCESSFULLY,
        result
    })
}

export const updateAnswerConstructiveResultController = async (
    req: Request<UpdateAnswerConstructiveResultReqParams, any, UpdateAnswerConstructiveResultReqBody>,
    res: Response
) => {
    const { user_id: my_id } = req.decoded_authorization as TokenPayload
    const my_dating_profile_id = (req.dating_profile as DatingUser)._id as ObjectId
    const constructive_result = req.constructive_result as ConstructiveResult
    const me = my_dating_profile_id.equals(constructive_result.first_user.id) ? 'first_user' : 'second_user'
    const user_dating_profile = (await databaseService.datingUsers.findOne({
        _id: constructive_result[me === 'first_user' ? 'second_user' : 'first_user'].id
    })) as DatingUser
    const user_id = user_dating_profile.user_id.toString()
    const result = await constructiveResultService.updateAnswerConstructiveResult({
        constructiveResult: constructive_result,
        payload: req.body,
        me,
        my_id,
        user_id
    })

    return res.json({
        message: CONSTRUCTIVE_RESULTS_MESSAGES.UPDATE_ANSWER_CONSTRUCTIVE_RESULT_SUCCESSFULLY,
        result
    })
}
