import { ParamsDictionary } from 'express-serve-static-core'

import { Language, Sex } from '~/constants/enums'

export interface GetDatingProfileReqParams extends ParamsDictionary {
    profile_id: string
}

export interface CreateDatingProfileReqBody {
    name: string
    sex: Sex
    age: number
    height: number
    hometown: string
    language: Language
}

export interface UpdateDatingProfileReqBody extends Partial<CreateDatingProfileReqBody> {}
