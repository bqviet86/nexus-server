import { Router } from 'express'

import {
    deleteCommentController,
    getCommentsOfPostController,
    getRepliesOfCommentController,
    updateCommentController
} from '~/controllers/comments.controllers'
import {
    deleteCommentValidator,
    getCommentsOfPostValidator,
    getRepliesOfCommentValidator,
    updateCommentValidator
} from '~/middlewares/comments.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const commentsRouter = Router()

/**
 * Description: Get replies of a comment
 * Path: /replies/:comment_id
 * Method: GET
 * Params: { comment_id: string }
 */
commentsRouter.get(
    '/replies/:comment_id',
    getRepliesOfCommentValidator,
    wrapRequestHandler(getRepliesOfCommentController)
)

/**
 * Description: Get comments of a post
 * Path: /:post_id
 * Method: GET
 * Params: { post_id: string }
 */
commentsRouter.get('/:post_id', getCommentsOfPostValidator, wrapRequestHandler(getCommentsOfPostController))

/**
 * Description: Update a comment
 * Path: /:comment_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { comment_id: string }
 * Body: { content: string, media: Media | null }
 */
commentsRouter.patch(
    '/:comment_id',
    accessTokenValidator,
    updateCommentValidator,
    wrapRequestHandler(updateCommentController)
)

/**
 * Description: Delete a comment
 * Path: /:comment_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { comment_id: string }
 */
commentsRouter.delete(
    '/:comment_id',
    accessTokenValidator,
    deleteCommentValidator,
    wrapRequestHandler(deleteCommentController)
)

export default commentsRouter
