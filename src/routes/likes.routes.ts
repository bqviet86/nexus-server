import { Router } from 'express'

import { likePostController, unlikePostController } from '~/controllers/likes.controllers'
import { likePostValidator, unlikePostValidator } from '~/middlewares/likes.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * Description: Like a post
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { post_id: string }
 */
likesRouter.post('/', accessTokenValidator, likePostValidator, wrapRequestHandler(likePostController))

/**
 * Description: Unlike a post
 * Path: /:post_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { post_id: string }
 */
likesRouter.delete('/:post_id', accessTokenValidator, unlikePostValidator, wrapRequestHandler(unlikePostController))

export default likesRouter
