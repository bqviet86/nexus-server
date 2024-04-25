import { Request, Response } from 'express'

import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { GetConversationReqParams, GetConversationReqQuery } from '~/models/requests/Conversation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationService from '~/services/conversations.services'

export const getAllConversationsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await conversationService.getAllConversations(user_id)

    return res.json({
        message: CONVERSATIONS_MESSAGES.GET_ALL_CONVERSATIONS_SUCCESSFULLY,
        result
    })
}

export const getConversationController = async (
    req: Request<GetConversationReqParams, any, any, GetConversationReqQuery>,
    res: Response
) => {
    const { user_id: sender_id } = req.decoded_authorization as TokenPayload
    const { receiver_id } = req.params
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    const { conversations, total_conversations } = await conversationService.getConversation({
        sender_id,
        receiver_id,
        page,
        limit
    })

    return res.json({
        message: CONVERSATIONS_MESSAGES.GET_CONVERSATION_SUCCESSFULLY,
        result: {
            conversations,
            page,
            limit,
            total_pages: Math.ceil(total_conversations / limit)
        }
    })
}
