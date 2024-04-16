import { Router } from 'express'

import {
    getAllDatingConversationsController,
    getDatingConversationController
} from '~/controllers/datingConversations.controllers'
import { checkDatingProfileExistence, paginationValidator } from '~/middlewares/common.middlewares'
import { getDatingConversationValidator } from '~/middlewares/datingConversations.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const datingConversationsRouter = Router()

/**
 * Description: Get all dating conversations
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
datingConversationsRouter.get(
    '/',
    accessTokenValidator,
    checkDatingProfileExistence,
    wrapRequestHandler(getAllDatingConversationsController)
)

/**
 * Description: Get dating conversation
 * Path: /receivers/:receiver_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: receiver_id
 * Query: limit, page
 */
datingConversationsRouter.get(
    '/receivers/:receiver_id',
    accessTokenValidator,
    checkDatingProfileExistence,
    paginationValidator,
    getDatingConversationValidator,
    wrapRequestHandler(getDatingConversationController)
)

export default datingConversationsRouter
