import { Router } from 'express'

import { createPostController, deletePostController, getPostController } from '~/controllers/posts.controllers'
import {
    createPostValidator,
    deletePostValidator,
    getPostValidator,
    toLowerCaseHashTags
} from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const postsRouter = Router()

/**
 * Description: Create a post
 * Path: /
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: CreatePostReqBody
 */
postsRouter.post(
    '/',
    accessTokenValidator,
    createPostValidator,
    toLowerCaseHashTags,
    wrapRequestHandler(createPostController)
)

/**
 * Description: Get a post
 * Path: /:post_id
 * Method: GET
 * Params: { post_id: string }
 */
postsRouter.get('/:post_id', getPostValidator, wrapRequestHandler(getPostController))

/**
 * Description: Delete a post
 * Path: /:post_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 * Params: { post_id: string }
 */
postsRouter.delete('/:post_id', accessTokenValidator, deletePostValidator, wrapRequestHandler(deletePostController))

export default postsRouter
