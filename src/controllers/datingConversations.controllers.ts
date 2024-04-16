import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { DATING_CONVERSATIONS_MESSAGES } from '~/constants/messages'
import {
    GetDatingConversationReqParams,
    GetDatingConversationReqQuery
} from '~/models/requests/DatingConversation.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import datingConversationService from '~/services/datingConversations.services'

export const getAllDatingConversationsController = async (req: Request, res: Response) => {
    const { _id: dating_profile_id } = req.dating_profile as DatingUser
    const result = await datingConversationService.getAllDatingConversations((dating_profile_id as ObjectId).toString())

    return res.json({
        message: DATING_CONVERSATIONS_MESSAGES.GET_ALL_DATING_CONVERSATIONS_SUCCESSFULLY,
        result
    })
}

export const getDatingConversationController = async (
    req: Request<GetDatingConversationReqParams, any, any, GetDatingConversationReqQuery>,
    res: Response
) => {
    const { _id: sender_id } = req.dating_profile as DatingUser
    const { receiver_id } = req.params
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    const { conversations, total_conversations } = await datingConversationService.getDatingConversation({
        sender_id: (sender_id as ObjectId).toString(),
        receiver_id,
        page,
        limit
    })

    return res.json({
        message: DATING_CONVERSATIONS_MESSAGES.GET_DATING_CONVERSATION_SUCCESSFULLY,
        result: {
            conversations,
            page,
            limit,
            total_pages: Math.ceil(total_conversations / limit)
        }
    })
}
