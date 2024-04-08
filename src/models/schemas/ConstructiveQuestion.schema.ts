import { ObjectId } from 'mongodb'

interface ConstructiveQuestionConstructor {
    _id?: ObjectId
    question: string
    options: string[]
    created_at?: Date
    updated_at?: Date
}

export default class ConstructiveQuestion {
    _id?: ObjectId
    question: string
    options: string[]
    created_at: Date
    updated_at: Date

    constructor(question: ConstructiveQuestionConstructor) {
        const date = new Date()

        this._id = question._id
        this.question = question.question
        this.options = question.options
        this.created_at = question.created_at || date
        this.updated_at = question.updated_at || date
    }
}
