import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { POSTS_MESSAGES } from '~/constants/messages'
import { CreatePostReqBody, DeletePostReqParams, GetPostReqParams } from '~/models/requests/Post.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Post from '~/models/schemas/Post.schema'
import postService from '~/services/posts.services'

export const createPostController = async (req: Request<ParamsDictionary, any, CreatePostReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await postService.createPost(user_id, req.body)

    return res.json({
        message: POSTS_MESSAGES.CREATE_POST_SUCCESSFULLY,
        result
    })
}

export const getPostController = async (req: Request<GetPostReqParams>, res: Response) => {
    const post = req.post as Post

    return res.json({
        message: POSTS_MESSAGES.GET_POST_SUCCESSFULLY,
        result: post
    })
}

export const deletePostController = async (req: Request<DeletePostReqParams>, res: Response) => {
    const { post_id } = req.params
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await postService.deletePost(post_id, user_id)

    return res.json(result)
}
