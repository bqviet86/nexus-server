import { ObjectId } from 'mongodb'

interface LikeConstructor {
    _id?: ObjectId
    user_id: ObjectId
    post_id: ObjectId
    created_at?: Date
}

export default class Like {
    _id?: ObjectId
    user_id: ObjectId
    post_id: ObjectId
    created_at?: Date

    constructor(like: LikeConstructor) {
        this._id = like._id
        this.user_id = like.user_id
        this.post_id = like.post_id
        this.created_at = like.created_at || new Date()
    }
}
