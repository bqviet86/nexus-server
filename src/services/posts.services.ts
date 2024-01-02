import { ObjectId, WithId } from 'mongodb'

import { POSTS_MESSAGES } from '~/constants/messages'
import { CreatePostReqBody } from '~/models/requests/Post.requests'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Post from '~/models/schemas/Post.schema'
import databaseService from './database.services'

class PostService {
    async checkAndCreateHashtag(hashtags: string[]) {
        const hashtagDocuments = await Promise.all(
            hashtags.map((hashtag) =>
                databaseService.hashtags.findOneAndUpdate(
                    { name: hashtag },
                    {
                        $setOnInsert: new Hashtag({ name: hashtag })
                    },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                )
            )
        )
        const hashtagIds = (hashtagDocuments as WithId<Hashtag>[]).map((hashtag) => hashtag._id)

        return hashtagIds
    }

    async createPost(user_id: string, payload: CreatePostReqBody) {
        const hashtags = await this.checkAndCreateHashtag(payload.hashtags)
        const result = await databaseService.posts.insertOne(
            new Post({
                ...payload,
                user_id: new ObjectId(user_id),
                parent_id: payload.parent_id ? new ObjectId(payload.parent_id) : null,
                hashtags,
                mentions: payload.mentions.map((mention) => new ObjectId(mention))
            })
        )
        const post = await databaseService.posts.findOne({ _id: result.insertedId })

        return post
    }

    async deletePost(post_id: string, user_id: string) {
        await databaseService.posts.deleteOne({
            _id: new ObjectId(post_id),
            user_id: new ObjectId(user_id)
        })

        return { message: POSTS_MESSAGES.DELETE_POST_SUCCESSFULLY }
    }
}

const postService = new PostService()

export default postService
