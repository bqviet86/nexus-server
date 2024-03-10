import { ParamsDictionary } from 'express-serve-static-core'
import { Media } from '../Types'

export interface GetCommentsOfPostReqParams extends ParamsDictionary {
    post_id: string
}

export interface GetRepliesOfCommentReqParams extends ParamsDictionary {
    comment_id: string
}

export interface UpdateCommentReqParams extends ParamsDictionary {
    comment_id: string
}

export interface UpdateCommentReqBody {
    content: string
    media: Media | null
}

export interface DeleteCommentReqParams extends ParamsDictionary {
    comment_id: string
}
