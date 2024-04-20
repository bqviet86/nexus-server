import { Router } from 'express'

import {
    createConstructiveQuestionController,
    deleteConstructiveQuestionController,
    getAllConstructiveQuestionsController,
    updateConstructiveQuestionController
} from '~/controllers/constructiveQuestions.controllers'
import { filterMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
    createConstructiveQuestionValidator,
    deleteConstructiveQuestionValidator,
    getAllConstructiveQuestionsValidator,
    updateConstructiveQuestionValidator
} from '~/middlewares/constructiveQuestions.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { UpdateConstructiveQuestionReqBody } from '~/models/requests/ConstructiveQuestions.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const constructiveQuestionsRouter = Router()

/**
 * Description: Get all constructive questions
 * Path: /all
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { question?: string, page: number, limit: number }
 */
constructiveQuestionsRouter.get(
    '/all',
    accessTokenValidator,
    isAdminValidator,
    getAllConstructiveQuestionsValidator,
    paginationValidator,
    wrapRequestHandler(getAllConstructiveQuestionsController)
)

/**
 * Description: Create a constructive question
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { question: string, options: string[] }
 */
constructiveQuestionsRouter.post(
    '/',
    accessTokenValidator,
    isAdminValidator,
    createConstructiveQuestionValidator,
    wrapRequestHandler(createConstructiveQuestionController)
)

/**
 * Description: Update a constructive question
 * Path: /:constructive_question_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { constructive_question_id: string }
 * Body: { question?: string, options?: string[] }
 */
constructiveQuestionsRouter.patch(
    '/:constructive_question_id',
    accessTokenValidator,
    isAdminValidator,
    updateConstructiveQuestionValidator,
    filterMiddleware<UpdateConstructiveQuestionReqBody>(['question', 'options']),
    wrapRequestHandler(updateConstructiveQuestionController)
)

/**
 * Description: Delete a constructive question
 * Path: /:constructive_question_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { constructive_question_id: string }
 */
constructiveQuestionsRouter.delete(
    '/:constructive_question_id',
    accessTokenValidator,
    isAdminValidator,
    deleteConstructiveQuestionValidator,
    wrapRequestHandler(deleteConstructiveQuestionController)
)

export default constructiveQuestionsRouter
