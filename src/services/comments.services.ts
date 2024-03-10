import { Document, ObjectId } from 'mongodb'

import Comment from '~/models/schemas/Comment.schema'
import databaseService from './database.services'
import { UpdateCommentReqBody } from '~/models/requests/Comment.requests'
import { COMMENTS_MESSAGES } from '~/constants/messages'

class CommentService {
    private commonAggregateComments: Document[] = [
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
            $project: {
                user_id: 0,
                user: {
                    password: 0
                }
            }
        }
    ]

    async getCommentsOfPost(post_id: string) {
        const comments = await databaseService.comments
            .aggregate<Comment>([
                {
                    $match: {
                        post_id: new ObjectId(post_id),
                        parent_id: null
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                ...this.commonAggregateComments,
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'parent_id',
                        as: 'children'
                    }
                },
                {
                    $addFields: {
                        children_count: {
                            $size: '$children'
                        }
                    }
                },
                {
                    $project: {
                        children: 0
                    }
                }
            ])
            .toArray()

        return comments
    }

    async getRepliesOfComment(comment_id: string) {
        const replies = await databaseService.comments
            .aggregate<Comment>([
                {
                    $match: {
                        parent_id: new ObjectId(comment_id)
                    }
                },
                {
                    $sort: {
                        created_at: 1
                    }
                },
                ...this.commonAggregateComments
            ])
            .toArray()

        return replies
    }

    async createComment(
        payload: Pick<Comment, 'content' | 'media'> & { user_id: string; post_id: string; parent_id: string | null }
    ) {
        const { user_id, post_id, parent_id, content, media } = payload
        const result = await databaseService.comments.insertOne(
            new Comment({
                user_id: new ObjectId(user_id),
                post_id: new ObjectId(post_id),
                parent_id: parent_id ? new ObjectId(parent_id) : null,
                content,
                media
            })
        )
        const [comment] = await databaseService.comments
            .aggregate<Comment>([
                {
                    $match: {
                        _id: result.insertedId
                    }
                },
                ...this.commonAggregateComments
            ])
            .toArray()

        return comment
    }

    async updateComment(comment_id: string, payload: UpdateCommentReqBody) {
        const result = await databaseService.comments.findOneAndUpdate(
            {
                _id: new ObjectId(comment_id)
            },
            {
                $set: payload,
                $currentDate: {
                    updated_at: true
                }
            },
            {
                returnDocument: 'after'
            }
        )

        return result as Comment
    }

    async deleteComment(comment_id: string) {
        await databaseService.comments.deleteOne({
            _id: new ObjectId(comment_id)
        })

        return { message: COMMENTS_MESSAGES.DELETE_COMMENT_SUCCESSFULLY }
    }
}

const commentService = new CommentService()

export default commentService
