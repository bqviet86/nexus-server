import { ParamsDictionary, Query } from 'express-serve-static-core'
import { PaginationReqQuery } from './Common.requests'

export interface GetConversationReqParams extends ParamsDictionary {
    receiver_id: string
}

export interface GetConversationReqQuery extends PaginationReqQuery, Query {}
