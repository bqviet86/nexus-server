import { Router } from 'express'

import {
    createConstructiveResultController,
    getConstructiveResultController,
    updateAnswerConstructiveResultController
} from '~/controllers/constructiveResults.controllers'
import {
    checkDatingProfileExistence,
    constructiveResultIdValidator,
    questionIdConstructiveResultValidator
} from '~/middlewares/common.middlewares'
import {
    createConstructiveResultValidator,
    getConstructiveResultValidator,
    updateAnswerConstructiveResultValidator
} from '~/middlewares/constructiveResults.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const constructiveResultsRouter = Router()

/**
 * Description: Create constructive result
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateConstructiveResultReqBody
 */
constructiveResultsRouter.post(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    createConstructiveResultValidator,
    wrapRequestHandler(createConstructiveResultController)
)

/**
 * Description: Get constructive result
 * Path: /:dating_call_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: dating_call_id
 */
constructiveResultsRouter.get(
    '/:dating_call_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    getConstructiveResultValidator,
    wrapRequestHandler(getConstructiveResultController)
)

/**
 * Description: Update answer constructive result
 * Path: /:constructive_result_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: constructive_result_id
 * Body: { question_id: string, answer: string }
 */
constructiveResultsRouter.patch(
    '/:constructive_result_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    constructiveResultIdValidator,
    questionIdConstructiveResultValidator,
    updateAnswerConstructiveResultValidator,
    wrapRequestHandler(updateAnswerConstructiveResultController)
)

export default constructiveResultsRouter
