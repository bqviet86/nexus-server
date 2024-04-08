import { ObjectId } from 'mongodb'

interface DatingCallConstructor {
    _id?: ObjectId
    first_user_id: ObjectId
    second_user_id: ObjectId
    constructive_result_id?: ObjectId
    duration: number
    created_at?: Date
    updated_at?: Date
}

export default class DatingCall {
    _id?: ObjectId
    first_user_id: ObjectId
    second_user_id: ObjectId
    constructive_result_id: ObjectId | null
    duration: number
    created_at: Date
    updated_at: Date

    constructor(call: DatingCallConstructor) {
        const date = new Date()

        this._id = call._id
        this.first_user_id = call.first_user_id
        this.second_user_id = call.second_user_id
        this.constructive_result_id = call.constructive_result_id || null
        this.duration = call.duration
        this.created_at = call.created_at || date
        this.updated_at = call.updated_at || date
    }
}
