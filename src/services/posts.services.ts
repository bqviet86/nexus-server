import { ObjectId, WithId } from 'mongodb'

import { POSTS_MESSAGES } from '~/constants/messages'
import { MediaTypes, VideoEncodingStatus } from '~/constants/enums'
import { CreatePostReqBody } from '~/models/requests/Post.requests'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Post from '~/models/schemas/Post.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import mediaService from './medias.services'
import databaseService from './database.services'
import { io, socketUsers } from '~/utils/socket'

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
                hashtags
            })
        )
        const post = await databaseService.posts.findOne({ _id: result.insertedId })

        // Check video status
        const videos = payload.medias.filter((media) => media.type === MediaTypes.Video)

        if (videos.length) {
            const intervalId = setInterval(async () => {
                const videosStatus = await Promise.all(
                    videos.map((video) => {
                        const idName = video.url.split('/')[0]
                        return mediaService.getVideoStatus(idName)
                    })
                )
                const isAllVideoReady = (videosStatus as WithId<VideoStatus>[]).every(
                    (videoStatus) => videoStatus.status === VideoEncodingStatus.Success
                )

                if (isAllVideoReady) {
                    socketUsers[user_id].socket_ids.forEach((socket_id) => {
                        io.to(socket_id).emit('create_post_successfully', {
                            message: POSTS_MESSAGES.CREATE_POST_SUCCESSFULLY,
                            result: post
                        })
                    })

                    clearInterval(intervalId)
                }
            }, 5000)
        }

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
