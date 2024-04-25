import { Document, ObjectId } from 'mongodb'

import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from './database.services'

class ConversationService {
    commonAggregateConversations: Document[] = [
        {
            $lookup: {
                from: 'users',
                localField: 'sender_id',
                foreignField: '_id',
                as: 'sender'
            }
        },
        {
            $unwind: {
                path: '$sender'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'receiver_id',
                foreignField: '_id',
                as: 'receiver'
            }
        },
        {
            $unwind: {
                path: '$receiver'
            }
        },
        {
            $project: {
                sender_id: 0,
                receiver_id: 0,
                sender: {
                    password: 0
                },
                receiver: {
                    password: 0
                }
            }
        }
    ]

    async getAllConversations(user_id: string) {
        const conversations = await databaseService.conversations
            .aggregate<Conversation>([
                {
                    $match: {
                        $or: [
                            {
                                sender_id: new ObjectId(user_id)
                            },
                            {
                                receiver_id: new ObjectId(user_id)
                            }
                        ]
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: {
                                if: {
                                    $eq: ['$sender_id', new ObjectId(user_id)]
                                },
                                then: '$receiver_id',
                                else: '$sender_id'
                            }
                        },
                        latestConversation: {
                            $first: '$$ROOT'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$latestConversation._id',
                        sender_id: {
                            $first: '$latestConversation.sender_id'
                        },
                        receiver_id: {
                            $first: '$latestConversation.receiver_id'
                        },
                        content: {
                            $first: '$latestConversation.content'
                        },
                        created_at: {
                            $first: '$latestConversation.created_at'
                        },
                        updated_at: {
                            $first: '$latestConversation.updated_at'
                        }
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                ...this.commonAggregateConversations
            ])
            .toArray()

        return conversations
    }

    async getConversation({
        sender_id,
        receiver_id,
        page,
        limit
    }: {
        sender_id: string
        receiver_id: string
        page: number
        limit: number
    }) {
        const [{ conversations, total_conversations }] = await databaseService.conversations
            .aggregate<{
                conversations: Conversation[]
                total_conversations: number
            }>([
                {
                    $match: {
                        $or: [
                            {
                                sender_id: new ObjectId(sender_id),
                                receiver_id: new ObjectId(receiver_id)
                            },
                            {
                                sender_id: new ObjectId(receiver_id),
                                receiver_id: new ObjectId(sender_id)
                            }
                        ]
                    }
                },
                {
                    $facet: {
                        conversations: [
                            {
                                $sort: {
                                    created_at: -1
                                }
                            },
                            {
                                $skip: limit * (page - 1)
                            },
                            {
                                $limit: limit
                            },
                            ...this.commonAggregateConversations
                        ],
                        total: [
                            {
                                $count: 'total_conversations'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$total',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        conversations: '$conversations',
                        total_conversations: '$total.total_conversations'
                    }
                }
            ])
            .toArray()

        return {
            conversations: conversations || [],
            total_conversations: total_conversations || 0
        }
    }
}

const conversationService = new ConversationService()

export default conversationService
