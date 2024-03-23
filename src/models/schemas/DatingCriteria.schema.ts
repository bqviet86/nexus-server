import { ObjectId } from 'mongodb'

import { Sex, Language } from '~/constants/enums'

interface DatingCriteriaConstructor {
    _id?: ObjectId
    dating_user_id: ObjectId
    sex: Sex
    age_range: number[]
    height_range: number[]
    hometown: string
    language: Language
    created_at?: Date
    updated_at?: Date
}

export default class DatingCriteria {
    _id?: ObjectId
    dating_user_id: ObjectId
    sex: Sex
    age_range: number[]
    height_range: number[]
    hometown: string
    language: Language
    created_at: Date
    updated_at: Date

    constructor(criteria: DatingCriteriaConstructor) {
        const date = new Date()

        this._id = criteria._id
        this.dating_user_id = criteria.dating_user_id
        this.sex = criteria.sex
        this.age_range = criteria.age_range
        this.height_range = criteria.height_range
        this.hometown = criteria.hometown
        this.language = criteria.language
        this.created_at = criteria.created_at || date
        this.updated_at = criteria.updated_at || date
    }
}
