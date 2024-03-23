import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { DATING_CRITERIAS_MESSAGES } from '~/constants/messages'
import { CreateDatingCriteriaReqBody, UpdateDatingCriteriaReqBody } from '~/models/requests/DatingCriteria.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import datingCriteriaService from '~/services/datingCriterias.services'

export const getDatingCriteriaController = async (req: Request, res: Response) => {
    const dating_profile = req.dating_profile as DatingUser
    const result = await datingCriteriaService.getDatingCriteria(dating_profile)

    return res.json({
        message: DATING_CRITERIAS_MESSAGES.GET_DATING_CRITERIA_SUCCESSFULLY,
        result
    })
}

export const createDatingCriteriaController = async (
    req: Request<ParamsDictionary, any, CreateDatingCriteriaReqBody>,
    res: Response
) => {
    const dating_profile = req.dating_profile as DatingUser
    const result = await datingCriteriaService.createDatingCriteria({ dating_profile, payload: req.body })

    return res.json({
        message: DATING_CRITERIAS_MESSAGES.CREATE_DATING_CRITERIA_SUCCESSFULLY,
        result
    })
}

export const updateDatingCriteriaController = async (
    req: Request<ParamsDictionary, any, UpdateDatingCriteriaReqBody>,
    res: Response
) => {
    const dating_profile = req.dating_profile as DatingUser
    const result = await datingCriteriaService.updateDatingCriteria({ dating_profile, payload: req.body })

    return res.json({
        message: DATING_CRITERIAS_MESSAGES.UPDATE_DATING_CRITERIA_SUCCESSFULLY,
        result
    })
}
