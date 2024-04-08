import { ObjectId } from 'mongodb'

import { ConstructiveUserAnswer } from '../Types'

interface ConstructiveResultConstructor {
    _id?: ObjectId
    first_user: ConstructiveUserAnswer
    second_user: ConstructiveUserAnswer
    compatibility?: number
    created_at?: Date
    updated_at?: Date
}

export default class ConstructiveResult {
    _id?: ObjectId
    first_user: ConstructiveUserAnswer
    second_user: ConstructiveUserAnswer
    compatibility: number | null
    created_at: Date
    updated_at?: Date

    constructor(result: ConstructiveResultConstructor) {
        const date = new Date()

        this._id = result._id
        this.first_user = result.first_user
        this.second_user = result.second_user
        this.compatibility = result.compatibility || null
        this.created_at = result.created_at || date
        this.updated_at = result.updated_at || date
    }
}
