import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateConstructiveResultReqBody {
    first_user_id: string
    second_user_id: string
}

export interface GetConstructiveResultReqParams extends ParamsDictionary {
    dating_call_id: string
}

export interface UpdateAnswerConstructiveResultReqParams extends ParamsDictionary {
    constructive_result_id: string
}

export interface UpdateAnswerConstructiveResultReqBody {
    question_id: string
    answer: string
}
