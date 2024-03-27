import { Router } from 'express'

import {
    createDatingProfileController,
    getDatingProfileController,
    updateDatingProfileController
} from '~/controllers/datingUsers.controllers'
import { checkDatingProfileExistence, filterMiddleware } from '~/middlewares/common.middlewares'
import {
    createDatingProfileValidator,
    getDatingProfileValidator,
    updateDatingProfileValidator
} from '~/middlewares/datingUsers.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { UpdateDatingProfileReqBody } from '~/models/requests/DatingUser.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const datingUsersRouter = Router()

/**
 * Description: Get dating profile
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 * Query: { checkId: 'user_id' | 'dating_user_id' }
 */
datingUsersRouter.get(
    '/:id',
    accessTokenValidator,
    getDatingProfileValidator,
    wrapRequestHandler(getDatingProfileController)
)

/**
 * Description: Create dating profile
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateDatingProfileReqBody
 */
datingUsersRouter.post(
    '/',
    accessTokenValidator,
    createDatingProfileValidator,
    wrapRequestHandler(createDatingProfileController)
)

/**
 * Description: Update dating profile
 * Path: /
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UpdateDatingProfileReqBody
 */
datingUsersRouter.patch(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    updateDatingProfileValidator,
    filterMiddleware<UpdateDatingProfileReqBody>(['name', 'sex', 'age', 'height', 'hometown', 'language']),
    wrapRequestHandler(updateDatingProfileController)
)

export default datingUsersRouter
