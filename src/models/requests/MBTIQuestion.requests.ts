import { ParamsDictionary, Query } from 'express-serve-static-core'

import { MBTIDimension } from '~/constants/enums'
import { PaginationReqQuery } from './Common.requests'
import { MBTIOption } from '../Types'

export interface GetAllMbtiQuestionsReqQuery extends PaginationReqQuery, Query {
    question?: string
}

export interface CreateMBTIQuestionReqBody {
    question: string
    dimension: MBTIDimension
    options: MBTIOption[]
}

export interface UpdateMBTIQuestionReqParams extends ParamsDictionary {
    mbti_question_id: string
}

export interface UpdateMBTIQuestionReqBody {
    question?: string
    dimension?: MBTIDimension
    options?: MBTIOption[]
}

export interface DeleteMBTIQuestionReqParams extends ParamsDictionary {
    mbti_question_id: string
}
