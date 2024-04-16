import { ParamsDictionary } from 'express-serve-static-core'
import { PaginationReqQuery } from './Common.requests'

export interface GetDatingConversationReqParams extends ParamsDictionary {
    receiver_id: string
}

export interface GetDatingConversationReqQuery extends PaginationReqQuery {}
