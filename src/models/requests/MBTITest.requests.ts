import { ParamsDictionary } from 'express-serve-static-core'

import { MBTIValue } from '~/constants/enums'

export interface UpdateAnswerMBTITestReqParams extends ParamsDictionary {
    mbti_test_id: string
}

export interface UpdateAnswerMBTITestReqBody {
    question_id: string
    answer: MBTIValue
}

export interface GetMBTITestReqParams extends ParamsDictionary {
    mbti_test_id: string
}

export interface CompleteMBTITestReqParams extends ParamsDictionary {
    mbti_test_id: string
}

export interface DeleteMBTITestReqParams extends ParamsDictionary {
    mbti_test_id: string
}
