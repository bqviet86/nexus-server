import { Document, ObjectId } from 'mongodb'

import { MBTITestStatus } from '~/constants/enums'
import { CreateDatingProfileReqBody, UpdateDatingProfileReqBody } from '~/models/requests/DatingUser.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import databaseService from './database.services'

class DatingUserService {
    commonAggregateDatingUsers(): Document[] {
        return [
            {
                $lookup: {
                    from: 'mbti_tests',
                    localField: '_id',
                    foreignField: 'dating_user_id',
                    as: 'mbti_tests'
                }
            },
            {
                $addFields: {
                    mbti_tests: {
                        $filter: {
                            input: '$mbti_tests',
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
                    mbti_test: {
                        $cond: {
                            if: {
                                $eq: [{ $size: '$mbti_tests' }, 0]
                            },
                            then: '',
                            else: {
                                $arrayElemAt: ['$mbti_tests', -1]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    mbti_type: {
                        $cond: {
                            if: {
                                $eq: ['$mbti_test', '']
                            },
                            then: '',
                            else: '$mbti_test.mbti_type'
                        }
                    }
                }
            },
            {
                $project: {
                    user_id: 0,
                    mbti_tests: 0,
                    mbti_test: 0
                }
            }
        ]
    }

    async createDatingProfile({ user_id, payload }: { user_id: string; payload: CreateDatingProfileReqBody }) {
        const result = await databaseService.datingUsers.insertOne(
            new DatingUser({
                ...payload,
                user_id: new ObjectId(user_id)
            })
        )
        const datingUser = await databaseService.datingUsers.findOne(
            {
                _id: result.insertedId
            },
            {
                projection: {
                    user_id: 0
                }
            }
        )

        return datingUser
    }

    async updateDatingProfile({ user_id, payload }: { user_id: string; payload: UpdateDatingProfileReqBody }) {
        const { name, sex, age, height, hometown, language } = payload
        const datingUser = await databaseService.datingUsers.findOneAndUpdate(
            { user_id: new ObjectId(user_id) },
            {
                $set: {
                    ...(name ? { name } : {}),
                    ...(sex ? { sex } : {}),
                    ...(age ? { age } : {}),
                    ...(height ? { height } : {}),
                    ...(hometown ? { hometown } : {}),
                    ...(language ? { language } : {})
                },
                $currentDate: {
                    updated_at: true
                }
            },
            {
                returnDocument: 'after',
                includeResultMetadata: false
            }
        )

        return datingUser
    }
}

const datingUserService = new DatingUserService()

export default datingUserService
