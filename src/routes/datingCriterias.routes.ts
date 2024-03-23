import { Router } from 'express'

import {
    createDatingCriteriaController,
    getDatingCriteriaController,
    updateDatingCriteriaController
} from '~/controllers/datingCriterias.controllers'
import { checkDatingProfileExistence, filterMiddleware } from '~/middlewares/common.middlewares'
import { createDatingCriteriaValidator, updateDatingCriteriaValidator } from '~/middlewares/datingCriterias.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { UpdateDatingCriteriaReqBody } from '~/models/requests/DatingCriteria.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const datingCriteriasRouter = Router()

/**
 * Description: Get dating criteria
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
datingCriteriasRouter.get(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    wrapRequestHandler(getDatingCriteriaController)
)

/**
 * Description: Create dating criteria
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateDatingCriteriaReqBody
 */
datingCriteriasRouter.post(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    createDatingCriteriaValidator,
    wrapRequestHandler(createDatingCriteriaController)
)

/**
 * Description: Update dating criteria
 * Path: /
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UpdateDatingCriteriaReqBody
 */
datingCriteriasRouter.patch(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    updateDatingCriteriaValidator,
    filterMiddleware<UpdateDatingCriteriaReqBody>(['sex', 'age_range', 'height_range', 'hometown', 'language']),
    wrapRequestHandler(updateDatingCriteriaController)
)

export default datingCriteriasRouter
