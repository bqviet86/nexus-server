import { ObjectId } from 'mongodb'

import { CreateDatingCriteriaReqBody, UpdateDatingCriteriaReqBody } from '~/models/requests/DatingCriteria.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import DatingCriteria from '~/models/schemas/DatingCriteria.schema'
import databaseService from './database.services'

class DatingCriteriaService {
    async getDatingCriteria(dating_profile: DatingUser) {
        const datingCriteria = await databaseService.datingCriterias.findOne(
            {
                dating_user_id: dating_profile._id as ObjectId
            },
            {
                projection: {
                    dating_user_id: 0
                }
            }
        )

        return datingCriteria
    }

    async createDatingCriteria({
        dating_profile,
        payload
    }: {
        dating_profile: DatingUser
        payload: CreateDatingCriteriaReqBody
    }) {
        const result = await databaseService.datingCriterias.insertOne(
            new DatingCriteria({
                ...payload,
                dating_user_id: dating_profile._id as ObjectId
            })
        )
        const datingCriteria = await databaseService.datingCriterias.findOne({
            _id: result.insertedId
        })

        return datingCriteria
    }

    async updateDatingCriteria({
        dating_profile,
        payload
    }: {
        dating_profile: DatingUser
        payload: UpdateDatingCriteriaReqBody
    }) {
        const { sex, age_range, height_range, hometown, language } = payload
        const datingCriteria = await databaseService.datingCriterias.findOneAndUpdate(
            { dating_user_id: dating_profile._id as ObjectId },
            {
                $set: {
                    ...(sex ? { sex } : {}),
                    ...(age_range ? { age_range } : {}),
                    ...(height_range ? { height_range } : {}),
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

        return datingCriteria
    }
}

const datingCriteriaService = new DatingCriteriaService()

export default datingCriteriaService
