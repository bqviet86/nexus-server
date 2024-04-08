import { Router } from 'express'

import { createDatingReviewController } from '~/controllers/datingReviews.controllers'
import { checkDatingProfileExistence } from '~/middlewares/common.middlewares'
import { createDatingReviewValidator } from '~/middlewares/datingReviews.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const datingReviewsRouter = Router()

/**
 * Description: Create dating review
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: CreateDatingReviewReqBody
 */
datingReviewsRouter.post(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    createDatingReviewValidator,
    wrapRequestHandler(createDatingReviewController)
)

export default datingReviewsRouter
