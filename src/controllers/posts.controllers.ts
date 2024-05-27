import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { POSTS_MESSAGES } from '~/constants/messages'
import { PaginationReqQuery } from '~/models/requests/Common.requests'
import {
    CreatePostReqBody,
    DeletePostReqParams,
    GetPostReqParams,
    GetProfilePostsReqParams,
    UpdatePostReqBody,
    UpdatePostReqParams
} from '~/models/requests/Post.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Post from '~/models/schemas/Post.schema'
import postService from '~/services/posts.services'

export const createPostController = async (req: Request<ParamsDictionary, any, CreatePostReqBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const parent_post = req.parent_post
    const result = await postService.createPost({ user_id, payload: req.body, parent_post })

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

export const getNewsFeedController = async (
    req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const { posts, total_posts } = await postService.getNewsFeed({ user_id, page, limit })

    return res.json({
        message: POSTS_MESSAGES.GET_NEWS_FEED_SUCCESSFULLY,
        result: {
            posts,
            page,
            limit,
            total_pages: Math.ceil(total_posts / limit)
        }
    })
}

export const getProfilePostsController = async (
    req: Request<GetProfilePostsReqParams, any, any, PaginationReqQuery>,
    res: Response
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { profile_id } = req.params
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const { posts, total_posts } = await postService.getProfilePosts({ user_id, profile_id, page, limit })

    return res.json({
        message: POSTS_MESSAGES.GET_PROFILE_POSTS_SUCCESSFULLY,
        result: {
            posts,
            page,
            limit,
            total_pages: Math.ceil(total_posts / limit)
        }
    })
}

export const updatePostController = async (
    req: Request<UpdatePostReqParams, any, UpdatePostReqBody>,
    res: Response
) => {
    const { post_id } = req.params
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await postService.updatePost(post_id, user_id, req.body)

    return res.json({
        message: POSTS_MESSAGES.UPDATE_POST_SUCCESSFULLY,
        result
    })
}

export const deletePostController = async (req: Request<DeletePostReqParams>, res: Response) => {
    const { post_id } = req.params
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await postService.deletePost(post_id, user_id)

    return res.json(result)
}
