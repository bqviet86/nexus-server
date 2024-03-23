import { ObjectId } from 'mongodb'

import { CreateDatingProfileReqBody, UpdateDatingProfileReqBody } from '~/models/requests/DatingUser.requests'
import databaseService from './database.services'
import DatingUser from '~/models/schemas/DatingUser.schema'

class DatingUserService {
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
