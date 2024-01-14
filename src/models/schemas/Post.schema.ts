import { ObjectId } from 'mongodb'

import { PostType } from '~/constants/enums'
import { Media } from '../Others'

interface PostConstructor {
    _id?: ObjectId
    user_id: ObjectId
    type: PostType
    content: string
    parent_id: ObjectId | null // null khi post gốc
    hashtags: ObjectId[]
    medias: Media[]
    created_at?: Date
    updated_at?: Date
}

export default class Post {
    _id?: ObjectId
    user_id: ObjectId
    type: PostType
    content: string
    parent_id: ObjectId | null // null khi post gốc
    hashtags: ObjectId[]
    medias: Media[]
    created_at?: Date
    updated_at?: Date

    constructor(post: PostConstructor) {
        const date = new Date()

        this._id = post._id
        this.user_id = post.user_id
        this.type = post.type
        this.content = post.content
        this.parent_id = post.parent_id
        this.hashtags = post.hashtags
        this.medias = post.medias
        this.created_at = post.created_at || date
        this.updated_at = post.updated_at || date
    }
}
