import { Language, Sex } from '~/constants/enums'

export interface CreateDatingCriteriaReqBody {
    sex: Sex
    age_range: number[]
    height_range: number[]
    hometown: string
    language: Language
}

export interface UpdateDatingCriteriaReqBody extends Partial<CreateDatingCriteriaReqBody> {}
