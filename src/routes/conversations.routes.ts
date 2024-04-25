import { Router } from 'express'

import { getAllConversationsController, getConversationController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { getConversationValidator } from '~/middlewares/conversations.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationsRouter = Router()

/**
 * Description: Get all conversations
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
conversationsRouter.get('/', accessTokenValidator, wrapRequestHandler(getAllConversationsController))

/**
 * Description: Get conversation
 * Path: /receivers/:receiver_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: receiver_id
 * Query: page, limit
 */
conversationsRouter.get(
    '/receivers/:receiver_id',
    accessTokenValidator,
    paginationValidator,
    getConversationValidator,
    wrapRequestHandler(getConversationController)
)

export default conversationsRouter
