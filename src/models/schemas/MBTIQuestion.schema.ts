import { ObjectId } from 'mongodb'

import { MBTIDimension } from '~/constants/enums'
import { MBTIOption } from '../Types'

interface MBTIQuestionConstructor {
    _id?: ObjectId
    question: string
    dimension: MBTIDimension
    options: MBTIOption[]
    created_at?: Date
    updated_at?: Date
}

export default class MBTIQuestion {
    _id?: ObjectId
    question: string
    dimension: MBTIDimension
    options: MBTIOption[]
    created_at: Date
    updated_at: Date

    constructor(mbtiQuestion: MBTIQuestionConstructor) {
        const date = new Date()

        this._id = mbtiQuestion._id
        this.question = mbtiQuestion.question
        this.dimension = mbtiQuestion.dimension
        this.options = mbtiQuestion.options
        this.created_at = mbtiQuestion.created_at || date
        this.updated_at = mbtiQuestion.updated_at || date
    }
}
