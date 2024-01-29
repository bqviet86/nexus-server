import { ObjectId } from 'mongodb'

import { FriendStatus } from '~/constants/enums'

interface FriendConstructor {
    _id?: ObjectId
    user_from_id: ObjectId
    user_to_id: ObjectId
    status?: FriendStatus
    created_at?: Date
    updated_at?: Date
}

export default class Friend {
    _id?: ObjectId
    user_from_id: ObjectId
    user_to_id: ObjectId
    status: FriendStatus
    created_at?: Date
    updated_at?: Date

    constructor(friend: FriendConstructor) {
        const date = new Date()

        this._id = friend._id
        this.user_from_id = friend.user_from_id
        this.user_to_id = friend.user_to_id
        this.status = friend.status || FriendStatus.Pending
        this.created_at = friend.created_at || date
        this.updated_at = friend.updated_at || date
    }
}
