import { ObjectId } from 'mongodb'

import { MBTITestStatus } from '~/constants/enums'
import { CreateDatingCallReqBody } from '~/models/requests/DatingCall.requests'
import DatingCall from '~/models/schemas/DatingCall.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import databaseService from './database.services'

class DatingCallService {
    async createDatingCall({
        first_user_id,
        second_user_id,
        constructive_result_id,
        duration
    }: CreateDatingCallReqBody) {
        const result = await databaseService.datingCalls.insertOne(
            new DatingCall({
                first_user_id: new ObjectId(first_user_id),
                second_user_id: new ObjectId(second_user_id),
                ...(constructive_result_id ? { constructive_result_id: new ObjectId(constructive_result_id) } : {}),
                duration
            })
        )
        const datingCall = await databaseService.datingCalls.findOne({
            _id: result.insertedId
        })

        return datingCall
    }

    async getAllDatingCalls({
        user_dating_profile_id,
        dating_profile
    }: {
        user_dating_profile_id?: string
        dating_profile: DatingUser
    }) {
        const datingCalls = await databaseService.datingCalls
            .aggregate<DatingCall>([
                {
                    $match: {
                        $or: [
                            {
                                first_user_id: dating_profile._id as ObjectId,
                                ...(user_dating_profile_id
                                    ? { second_user_id: new ObjectId(user_dating_profile_id) }
                                    : {})
                            },
                            {
                                second_user_id: dating_profile._id as ObjectId,
                                ...(user_dating_profile_id
                                    ? { first_user_id: new ObjectId(user_dating_profile_id) }
                                    : {})
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'dating_users',
                        localField: 'first_user_id',
                        foreignField: '_id',
                        as: 'first_user'
                    }
                },
                {
                    $unwind: {
                        path: '$first_user'
                    }
                },
                {
                    $lookup: {
                        from: 'dating_users',
                        localField: 'second_user_id',
                        foreignField: '_id',
                        as: 'second_user'
                    }
                },
                {
                    $unwind: {
                        path: '$second_user'
                    }
                },
                {
                    $lookup: {
                        from: 'mbti_tests',
                        localField: 'first_user._id',
                        foreignField: 'dating_user_id',
                        as: 'first_user.mbti_tests'
                    }
                },
                {
                    $addFields: {
                        'first_user.mbti_tests': {
                            $filter: {
                                input: '$first_user.mbti_tests',
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
                        'first_user.mbti_test': {
                            $cond: {
                                if: {
                                    $eq: [
                                        {
                                            $size: '$first_user.mbti_tests'
                                        },
                                        0
                                    ]
                                },
                                then: '',
                                else: {
                                    $arrayElemAt: ['$first_user.mbti_tests', -1]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        'first_user.mbti_type': {
                            $cond: {
                                if: {
                                    $eq: ['$first_user.mbti_test', '']
                                },
                                then: '',
                                else: '$first_user.mbti_test.mbti_type'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'mbti_tests',
                        localField: 'second_user._id',
                        foreignField: 'dating_user_id',
                        as: 'second_user.mbti_tests'
                    }
                },
                {
                    $addFields: {
                        'second_user.mbti_tests': {
                            $filter: {
                                input: '$second_user.mbti_tests',
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
                        'second_user.mbti_test': {
                            $cond: {
                                if: {
                                    $eq: [
                                        {
                                            $size: '$second_user.mbti_tests'
                                        },
                                        0
                                    ]
                                },
                                then: '',
                                else: {
                                    $arrayElemAt: ['$second_user.mbti_tests', -1]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        'second_user.mbti_type': {
                            $cond: {
                                if: {
                                    $eq: ['$second_user.mbti_test', '']
                                },
                                then: '',
                                else: '$second_user.mbti_test.mbti_type'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'constructive_results',
                        localField: 'constructive_result_id',
                        foreignField: '_id',
                        as: 'constructive_result'
                    }
                },
                {
                    $addFields: {
                        compatibility: {
                            $cond: {
                                if: {
                                    $eq: [
                                        {
                                            $size: '$constructive_result'
                                        },
                                        0
                                    ]
                                },
                                then: null,
                                else: {
                                    $let: {
                                        vars: {
                                            result: {
                                                $arrayElemAt: ['$constructive_result', 0]
                                            }
                                        },
                                        in: '$$result.compatibility'
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'dating_reviews',
                        localField: '_id',
                        foreignField: 'dating_call_id',
                        as: 'reviews'
                    }
                },
                {
                    $addFields: {
                        first_review: {
                            $filter: {
                                input: '$reviews',
                                as: 'review',
                                cond: {
                                    $eq: ['$$review.user_id', '$first_user._id']
                                }
                            }
                        },
                        second_review: {
                            $filter: {
                                input: '$reviews',
                                as: 'review',
                                cond: {
                                    $eq: ['$$review.user_id', '$second_user._id']
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$first_review',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: '$second_review',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        first_review: {
                            $ifNull: [
                                '$first_review',
                                {
                                    review_texts: [],
                                    stars_rating: 0
                                }
                            ]
                        },
                        second_review: {
                            $ifNull: [
                                '$second_review',
                                {
                                    review_texts: [],
                                    stars_rating: 0
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        'first_user.review_texts': '$first_review.review_texts',
                        'first_user.stars_rating': '$first_review.stars_rating',
                        'second_user.review_texts': '$second_review.review_texts',
                        'second_user.stars_rating': '$second_review.stars_rating'
                    }
                },
                {
                    $project: {
                        first_user_id: 0,
                        second_user_id: 0,
                        constructive_result_id: 0,
                        'first_user.user_id': 0,
                        'first_user.mbti_tests': 0,
                        'first_user.mbti_test': 0,
                        'second_user.user_id': 0,
                        'second_user.mbti_tests': 0,
                        'second_user.mbti_test': 0,
                        constructive_result: 0,
                        reviews: 0,
                        first_review: 0,
                        second_review: 0
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                }
            ])
            .toArray()

        return datingCalls
    }
}

const datingCallService = new DatingCallService()

export default datingCallService
