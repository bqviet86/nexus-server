import { Router } from 'express'

import { createDatingCallController, getAllDatingCallsController } from '~/controllers/datingCalls.controllers'
import { checkDatingProfileExistence } from '~/middlewares/common.middlewares'
import { createDatingCallValidator } from '~/middlewares/datingCalls.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const datingCallsRouter = Router()

/**
 * Description: Create dating call
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateDatingCallReqBody
 */
datingCallsRouter.post(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    createDatingCallValidator,
    wrapRequestHandler(createDatingCallController)
)

/**
 * Description: Get all dating calls
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
datingCallsRouter.get(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    wrapRequestHandler(getAllDatingCallsController)
)

export default datingCallsRouter
