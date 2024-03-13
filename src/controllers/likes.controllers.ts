import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { LikePostReqBody, UnlikePostReqParams } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Post from '~/models/schemas/Post.schema'
import likeService from '~/services/likes.services'

export const likePostController = async (req: Request<ParamsDictionary, any, LikePostReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { post_id } = req.body
    const post = req.post as Post
    const result = await likeService.likePost({ user_id, post_id, post })

    return res.json(result)
}

export const unlikePostController = async (req: Request<UnlikePostReqParams>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { post_id } = req.params
    const result = await likeService.unlikePost({ user_id, post_id })

    return res.json(result)
}
