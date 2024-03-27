import { Router } from 'express'

import {
    completeMBTITestController,
    createMBTITestController,
    deleteMBTITestController,
    getAllMBTITestsController,
    getMBTITestController,
    updateAnswerMBTITestController
} from '~/controllers/mbtiTests.controllers'
import {
    MBTITestIdValidator,
    checkDatingProfileExistence,
    questionIdMBTITestValidator
} from '~/middlewares/common.middlewares'
import { completeMBTITestValidator, updateAnswerMBTITestValidator } from '~/middlewares/mbtiTests.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mbtiTestsRouter = Router()

/**
 * Description: Create MBTI test
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 */
mbtiTestsRouter.post(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    wrapRequestHandler(createMBTITestController)
)

/**
 * Description: Get MBTI test
 * Path: /:mbti_test_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_test_id: string }
 */
mbtiTestsRouter.get(
    '/:mbti_test_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    MBTITestIdValidator,
    wrapRequestHandler(getMBTITestController)
)

/**
 * Description: Get all MBTI tests
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
mbtiTestsRouter.get(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    wrapRequestHandler(getAllMBTITestsController)
)

/**
 * Description: Update answer MBTI test
 * Path: /answer/:mbti_test_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_test_id: string }
 * Body: { question_id: string, answer: MBTIValue }
 */
mbtiTestsRouter.patch(
    '/answer/:mbti_test_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    MBTITestIdValidator,
    questionIdMBTITestValidator,
    updateAnswerMBTITestValidator,
    wrapRequestHandler(updateAnswerMBTITestController)
)

/**
 * Description: Complete MBTI test
 * Path: /complete/:mbti_test_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_test_id: string }
 */
mbtiTestsRouter.patch(
    '/complete/:mbti_test_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    MBTITestIdValidator,
    completeMBTITestValidator,
    wrapRequestHandler(completeMBTITestController)
)

/**
 * Description: Delete MBTI test
 * Path: /:mbti_test_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { mbti_test_id: string }
 */
mbtiTestsRouter.delete(
    '/:mbti_test_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    MBTITestIdValidator,
    wrapRequestHandler(deleteMBTITestController)
)

export default mbtiTestsRouter
