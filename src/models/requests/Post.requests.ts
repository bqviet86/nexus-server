import { ParamsDictionary } from 'express-serve-static-core'

import { PostType } from '~/constants/enums'
import { Media } from '../Others'

export interface CreatePostReqBody {
    type: PostType
    content: string
    parent_id: string | null
    hashtags: string[]
    medias: Media[]
}

export interface GetPostReqParams extends ParamsDictionary {
    post_id: string
}

export interface DeletePostReqParams extends ParamsDictionary {
    post_id: string
}
