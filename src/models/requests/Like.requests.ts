import { ParamsDictionary } from 'express-serve-static-core'

export interface LikePostReqBody {
    post_id: string
}

export interface UnlikePostReqParams extends ParamsDictionary {
    post_id: string
}
