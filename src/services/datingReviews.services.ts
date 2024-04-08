import { ObjectId } from 'mongodb'

import { CreateDatingReviewReqBody } from '~/models/requests/DatingReview.requests'
import DatingReview from '~/models/schemas/DatingReview.schema'
import databaseService from './database.services'

class DatingReviewService {
    async createDatingReview(payload: CreateDatingReviewReqBody) {
        const result = await databaseService.datingReviews.insertOne(
            new DatingReview({
                ...payload,
                user_id: new ObjectId(payload.user_id),
                rated_user_id: new ObjectId(payload.rated_user_id),
                dating_call_id: new ObjectId(payload.dating_call_id)
            })
        )
        const datingReview = await databaseService.datingReviews.findOne({
            _id: result.insertedId
        })

        return datingReview
    }
}

const datingReviewService = new DatingReviewService()

export default datingReviewService
