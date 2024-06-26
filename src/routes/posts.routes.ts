import { Router } from 'express'

import {
    createPostController,
    deletePostController,
    getNewsFeedController,
    getPostController,
    getProfilePostsController,
    updatePostController
} from '~/controllers/posts.controllers'
import { filterMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
    createPostValidator,
    deletePostValidator,
    getPostValidator,
    getProfilePostsValidator,
    toLowerCaseHashTags,
    updatePostValidator
} from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { UpdatePostReqBody } from '~/models/requests/Post.requests'
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
 * Description: Get posts of a profile
 * Path: /profile/:profile_id
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
 * Params: { profile_id: string }
 * Query: { page: number, limit: number }
 */
postsRouter.get(
    '/profile/:profile_id',
    accessTokenValidator,
    getProfilePostsValidator,
    paginationValidator,
    wrapRequestHandler(getProfilePostsController)
)

/**
 * Description: Get a post
 * Path: /:post_id
 * Method: GET
 * Params: { post_id: string }
 */
postsRouter.get('/:post_id', accessTokenValidator, getPostValidator, wrapRequestHandler(getPostController))

/**
 * Description: Update a post
 * Path: /:post_id
 * Method: PATCH
 * Headers: { Authorization: Bearer <access token> }
 * Params: { post_id: string }
 * Body: UpdatePostReqBody
 */
postsRouter.patch(
    '/:post_id',
    accessTokenValidator,
    updatePostValidator,
    toLowerCaseHashTags,
    filterMiddleware<UpdatePostReqBody>(['content', 'hashtags', 'medias']),
    wrapRequestHandler(updatePostController)
)

/**
 * Description: Delete a post
 * Path: /:post_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 * Params: { post_id: string }
 */
postsRouter.delete('/:post_id', accessTokenValidator, deletePostValidator, wrapRequestHandler(deletePostController))

export default postsRouter
