import { Router } from 'express'

import {
    createPostController,
    deletePostController,
    getNewsFeedController,
    getPostController
} from '~/controllers/posts.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
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
 * Description: Get news feed
 * Path: /news-feed
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
 * Query: { page: number, limit: number }
 */
postsRouter.get('/news-feed', accessTokenValidator, paginationValidator, wrapRequestHandler(getNewsFeedController))

/**
 * Description: Get a post
 * Path: /:post_id
 * Method: GET
 * Params: { post_id: string }
 */
postsRouter.get('/:post_id', accessTokenValidator, getPostValidator, wrapRequestHandler(getPostController))

/**
 * Description: Delete a post
 * Path: /:post_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 * Params: { post_id: string }
 */
postsRouter.delete('/:post_id', accessTokenValidator, deletePostValidator, wrapRequestHandler(deletePostController))

export default postsRouter
