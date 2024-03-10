import { ObjectId } from 'mongodb'

import { Media } from '../Types'

interface CommentConstructor {
    _id?: ObjectId
    user_id: ObjectId
    post_id: ObjectId
    parent_id: ObjectId | null
    content: string
    media: Media | null
    created_at?: Date
    updated_at?: Date
}

export default class Comment {
    _id?: ObjectId
    user_id: ObjectId
    post_id: ObjectId
    parent_id: ObjectId | null
    content: string
    media: Media | null
    created_at?: Date
    updated_at?: Date

    constructor(comment: CommentConstructor) {
        const date = new Date()

        this._id = comment._id
        this.user_id = comment.user_id
        this.post_id = comment.post_id
        this.parent_id = comment.parent_id
        this.content = comment.content
        this.media = comment.media
        this.created_at = comment.created_at || date
        this.updated_at = comment.updated_at || date
    }
}
