import { Request, Response } from 'express'

import { COMMENTS_MESSAGES } from '~/constants/messages'
import {
    DeleteCommentReqParams,
    GetCommentsOfPostReqParams,
    GetRepliesOfCommentReqParams,
    UpdateCommentReqBody,
    UpdateCommentReqParams
} from '~/models/requests/Comment.requests'
import commentService from '~/services/comments.services'

export const getCommentsOfPostController = async (req: Request<GetCommentsOfPostReqParams>, res: Response) => {
    const { post_id } = req.params
    const result = await commentService.getCommentsOfPost(post_id)

    return res.json({
        message: COMMENTS_MESSAGES.GET_COMMENTS_OF_POST_SUCCESSFULLY,
        result
    })
}

export const getRepliesOfCommentController = async (req: Request<GetRepliesOfCommentReqParams>, res: Response) => {
    const { comment_id } = req.params
    const result = await commentService.getRepliesOfComment(comment_id)

    return res.json({
        message: COMMENTS_MESSAGES.GET_REPLIES_OF_COMMENT_SUCCESSFULLY,
        result
    })
}

export const updateCommentController = async (
    req: Request<UpdateCommentReqParams, any, UpdateCommentReqBody>,
    res: Response
) => {
    const { comment_id } = req.params
    const result = await commentService.updateComment(comment_id, req.body)

    return res.json({
        message: COMMENTS_MESSAGES.UPDATE_COMMENT_SUCCESSFULLY,
        result
    })
}

export const deleteCommentController = async (req: Request<DeleteCommentReqParams>, res: Response) => {
    const { comment_id } = req.params
    const result = await commentService.deleteComment(comment_id)

    return res.json(result)
}
