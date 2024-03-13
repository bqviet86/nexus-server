import { Document, ObjectId, WithId } from 'mongodb'

import { POSTS_MESSAGES } from '~/constants/messages'
import { MediaTypes, NotificationPostAction, NotificationType, PostType, VideoEncodingStatus } from '~/constants/enums'
import { CreatePostReqBody } from '~/models/requests/Post.requests'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Post from '~/models/schemas/Post.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import mediaService from './medias.services'
import notificationService from './notifications.services'
import databaseService from './database.services'
import { io, socketUsers } from '~/utils/socket'
import { delayExecution } from '~/utils/handlers'

class PostService {
    commonAggregatePosts(user_id: string): Document[] {
        return [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user'
                }
            },
            {
                $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    like_count: {
                        $size: '$likes'
                    }
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'comments'
                }
            },
            {
                $addFields: {
                    comment_count: {
                        $size: '$comments'
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'share_posts'
                }
            },
            {
                $addFields: {
                    share_count: {
                        $size: '$share_posts'
                    }
                }
            },
            {
                $addFields: {
                    likes: {
                        $filter: {
                            input: '$likes',
                            as: 'like',
                            cond: {
                                $eq: ['$$like.user_id', new ObjectId(user_id)]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    is_liked: {
                        $eq: [{ $size: '$likes' }, 1]
                    }
                }
            },
            {
                $facet: {
                    withParent: [
                        {
                            $match: {
                                parent_id: {
                                    $ne: null
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'posts',
                                localField: 'parent_id',
                                foreignField: '_id',
                                as: 'parent_post'
                            }
                        },
                        {
                            $unwind: {
                                path: '$parent_post'
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'parent_post.user_id',
                                foreignField: '_id',
                                as: 'parent_post.user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$parent_post.user'
                            }
                        },
                        {
                            $lookup: {
                                from: 'hashtags',
                                localField: 'parent_post.hashtags',
                                foreignField: '_id',
                                as: 'parent_post.hashtags'
                            }
                        }
                    ],
                    withoutParent: [
                        {
                            $match: {
                                parent_id: null
                            }
                        },
                        {
                            $addFields: {
                                parent_post: null
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    post: {
                        $concatArrays: ['$withParent', '$withoutParent']
                    }
                }
            },
            {
                $unwind: {
                    path: '$post'
                }
            },
            {
                $project: {
                    post: {
                        user_id: 0,
                        parent_id: 0,
                        user: {
                            password: 0
                        },
                        likes: 0,
                        comments: 0,
                        share_posts: 0,
                        parent_post: {
                            user_id: 0,
                            parent_id: 0,
                            user: {
                                password: 0
                            }
                        }
                    }
                }
            }
        ]
    }

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

    async createPost({
        user_id,
        payload,
        parent_post
    }: {
        user_id: string
        payload: CreatePostReqBody
        parent_post: Post | undefined
    }) {
        const hashtags = await this.checkAndCreateHashtag(payload.hashtags)
        const result = await databaseService.posts.insertOne(
            new Post({
                ...payload,
                user_id: new ObjectId(user_id),
                parent_id: payload.parent_id ? new ObjectId(payload.parent_id) : null,
                hashtags
            })
        )
        const post = (await databaseService.posts.findOne({ _id: result.insertedId })) as WithId<Post>

        // Check video status
        const videos = payload.medias.filter((media) => media.type === MediaTypes.Video)

        if (post.type === PostType.Post && videos.length) {
            const intervalId = setInterval(async () => {
                const videosStatus = await Promise.all(
                    videos.map((video) => {
                        const idName = video.url.split('/')[0]
                        return mediaService.getVideoStatus(idName)
                    })
                )
                console.log('videosStatus', videosStatus)

                const isAllVideoReady = (videosStatus as WithId<VideoStatus>[]).every(
                    (videoStatus) => videoStatus.status === VideoEncodingStatus.Success
                )
                console.log('isAllVideoReady', isAllVideoReady)

                if (isAllVideoReady) {
                    const notification = await notificationService.createNotification({
                        user_to_id: user_id,
                        type: NotificationType.Post,
                        action: NotificationPostAction.HandlePostSuccess,
                        payload: {
                            post_id: post._id
                        }
                    })

                    await delayExecution(() => {
                        if (socketUsers[user_id]) {
                            socketUsers[user_id].socket_ids.forEach((socket_id) => {
                                io.to(socket_id).emit(NotificationPostAction.HandlePostSuccess, { notification })
                            })
                        }
                    }, 300)

                    clearInterval(intervalId)
                }
            }, 5000)
        }

        if (post.type === PostType.Share) {
            // Create id user of parent post
            const user_to_id = (parent_post as Post).user_id.toString()
            const notification = await notificationService.createNotification({
                user_from_id: user_id,
                user_to_id,
                type: NotificationType.Post,
                action: NotificationPostAction.SharePost,
                payload: {
                    post_id: post._id
                }
            })

            await delayExecution(() => {
                if (socketUsers[user_to_id]) {
                    socketUsers[user_to_id].socket_ids.forEach((socket_id) => {
                        io.to(socket_id).emit(NotificationPostAction.SharePost, {
                            notification,
                            post_id: post._id.toString()
                        })
                    })
                }
            }, 300)
        }

        return post
    }

    async getNewsFeed({ user_id, limit }: { user_id: string; limit: number }) {
        const previousPostIds = socketUsers[user_id].previous_post_ids.map((id) => new ObjectId(id))
        const [friends, total_posts] = await Promise.all([
            databaseService.friends
                .find({
                    $or: [
                        {
                            user_from_id: new ObjectId(user_id)
                        },
                        {
                            user_to_id: new ObjectId(user_id)
                        }
                    ]
                })
                .toArray(),
            databaseService.posts.countDocuments({
                user_id: {
                    $nin: [new ObjectId(user_id)]
                }
            })
        ])
        const friendIds = friends.map(({ user_from_id, user_to_id }) =>
            user_from_id.toString() === user_id ? user_to_id : user_from_id
        )

        const friendPosts = (
            await databaseService.posts
                .aggregate<{ post: Post }>([
                    {
                        $match: {
                            _id: {
                                $nin: previousPostIds
                            },
                            user_id: {
                                $in: friendIds
                            }
                        }
                    },
                    {
                        $sample: {
                            size: Math.round((limit * 20) / 100)
                        }
                    },
                    ...this.commonAggregatePosts(user_id)
                ])
                .toArray()
        ).map(({ post }) => post)
        const otherPosts = (
            await databaseService.posts
                .aggregate<{ post: Post }>([
                    {
                        $match: {
                            _id: {
                                $nin: previousPostIds
                            },
                            user_id: {
                                $nin: friendIds.concat(new ObjectId(user_id))
                            }
                        }
                    },
                    {
                        $sample: {
                            size: limit - friendPosts.length
                        }
                    },
                    ...this.commonAggregatePosts(user_id)
                ])
                .toArray()
        ).map(({ post }) => post)
        const posts = friendPosts
            .concat(otherPosts)
            .sort((a, b) => new Date(b.created_at as Date).getTime() - new Date(a.created_at as Date).getTime())

        socketUsers[user_id].previous_post_ids = socketUsers[user_id].previous_post_ids.concat(
            posts.map(({ _id }) => (_id as ObjectId).toString())
        )

        return { posts, total_posts }
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
