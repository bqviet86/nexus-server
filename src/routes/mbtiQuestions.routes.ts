import { Router } from 'express'

import {
    createMBTIQuestionController,
    deleteMBTIQuestionController,
    getAllMBTIQuestionsController,
    updateMBTIQuestionController
} from '~/controllers/mbtiQuestions.controllers'
import { filterMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
    createMBTIQuestionValidator,
    deleteMBTIQuestionValidator,
    getAllMBTIQuestionsValidator,
    updateMBTIQuestionValidator
} from '~/middlewares/mbtiQuestions.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { UpdateMBTIQuestionReqBody } from '~/models/requests/MBTIQuestion.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const mbtiQuestionsRouter = Router()

/**
 * Description: Get all MBTI questions
 * Path: /all
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { question?: string, page: number, limit: number }
 */
mbtiQuestionsRouter.get(
    '/all',
    accessTokenValidator,
    isAdminValidator,
    getAllMBTIQuestionsValidator,
    paginationValidator,
    wrapRequestHandler(getAllMBTIQuestionsController)
)

/**
 * Description: Create a MBTI question
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { question: string, dimension: MBTIDimension, options: MBTIOption[] }
 */
mbtiQuestionsRouter.post(
    '/',
    accessTokenValidator,
    isAdminValidator,
    createMBTIQuestionValidator,
    wrapRequestHandler(createMBTIQuestionController)
)

/**
 * Description: Update a MBTI question
 * Path: /:mbti_question_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_question_id: string }
 * Body: { question?: string, dimension?: MBTIDimension, options?: MBTIOption[] }
 */
mbtiQuestionsRouter.patch(
    '/:mbti_question_id',
    accessTokenValidator,
    isAdminValidator,
    updateMBTIQuestionValidator,
    filterMiddleware<UpdateMBTIQuestionReqBody>(['question', 'dimension', 'options']),
    wrapRequestHandler(updateMBTIQuestionController)
)

/**
 * Description: Delete a MBTI question
 * Path: /:mbti_question_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_question_id: string }
 */
mbtiQuestionsRouter.delete(
    '/:mbti_question_id',
    accessTokenValidator,
    isAdminValidator,
    deleteMBTIQuestionValidator,
    wrapRequestHandler(deleteMBTIQuestionController)
)

export default mbtiQuestionsRouter
