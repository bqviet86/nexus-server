import { ParamsDictionary } from 'express-serve-static-core'

import { PaginationReqQuery } from './Common.requests'

export interface GetAllConstructiveQuestionsReqQuery extends PaginationReqQuery {
    question?: string
}

export interface CreateConstructiveQuestionReqBody {
    question: string
    options: string[]
}

export interface UpdateConstructiveQuestionReqParams extends ParamsDictionary {
    constructive_question_id: string
}

export interface UpdateConstructiveQuestionReqBody {
    question?: string
    options?: string[]
}

export interface DeleteConstructiveQuestionReqParams extends ParamsDictionary {
    constructive_question_id: string
}
