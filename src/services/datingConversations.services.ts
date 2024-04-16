import { Document, ObjectId } from 'mongodb'

import { MBTITestStatus } from '~/constants/enums'
import DatingConversation from '~/models/schemas/DatingConversation.schema'
import databaseService from './database.services'

class DatingConversationService {
    commonAggregateDatingConversations: Document[] = [
        {
            $lookup: {
                from: 'dating_users',
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
                from: 'mbti_tests',
                localField: 'sender_id',
                foreignField: 'dating_user_id',
                as: 'sender.mbti_tests'
            }
        },
        {
            $addFields: {
                'sender.mbti_tests': {
                    $filter: {
                        input: '$sender.mbti_tests',
                        as: 'test',
                        cond: {
                            $eq: ['$$test.status', MBTITestStatus.Completed]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'sender.mbti_test': {
                    $cond: {
                        if: {
                            $eq: [
                                {
                                    $size: '$sender.mbti_tests'
                                },
                                0
                            ]
                        },
                        then: '',
                        else: {
                            $arrayElemAt: ['$sender.mbti_tests', -1]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'sender.mbti_type': {
                    $cond: {
                        if: {
                            $eq: ['$sender.mbti_test', '']
                        },
                        then: '',
                        else: '$sender.mbti_test.mbti_type'
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'dating_users',
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
            $lookup: {
                from: 'mbti_tests',
                localField: 'receiver_id',
                foreignField: 'dating_user_id',
                as: 'receiver.mbti_tests'
            }
        },
        {
            $addFields: {
                'receiver.mbti_tests': {
                    $filter: {
                        input: '$receiver.mbti_tests',
                        as: 'test',
                        cond: {
                            $eq: ['$$test.status', MBTITestStatus.Completed]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'receiver.mbti_test': {
                    $cond: {
                        if: {
                            $eq: [
                                {
                                    $size: '$receiver.mbti_tests'
                                },
                                0
                            ]
                        },
                        then: '',
                        else: {
                            $arrayElemAt: ['$receiver.mbti_tests', -1]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'receiver.mbti_type': {
                    $cond: {
                        if: {
                            $eq: ['$receiver.mbti_test', '']
                        },
                        then: '',
                        else: '$receiver.mbti_test.mbti_type'
                    }
                }
            }
        },
        {
            $project: {
                sender_id: 0,
                receiver_id: 0,
                'sender.mbti_tests': 0,
                'sender.mbti_test': 0,
                'receiver.mbti_tests': 0,
                'receiver.mbti_test': 0
            }
        }
    ]

    async getAllDatingConversations(dating_profile_id: string) {
        const conversations = await databaseService.datingConversations
            .aggregate<DatingConversation>([
                {
                    $match: {
                        $or: [
                            {
                                sender_id: new ObjectId(dating_profile_id)
                            },
                            {
                                receiver_id: new ObjectId(dating_profile_id)
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
                                    $eq: ['$sender_id', new ObjectId(dating_profile_id)]
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
                ...this.commonAggregateDatingConversations
            ])
            .toArray()

        return conversations
    }

    async getDatingConversation({
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
        const [{ conversations, total_conversations }] = await databaseService.datingConversations
            .aggregate<{
                conversations: DatingConversation[]
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
                            ...this.commonAggregateDatingConversations
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

const datingConversationService = new DatingConversationService()

export default datingConversationService
