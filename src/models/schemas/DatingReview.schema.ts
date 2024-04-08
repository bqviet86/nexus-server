import { ObjectId } from 'mongodb'

interface DatingReviewConstructor {
    _id?: ObjectId
    user_id: ObjectId
    rated_user_id: ObjectId
    dating_call_id: ObjectId
    review_texts: string[]
    stars_rating: number
    created_at?: Date
}

export default class DatingReview {
    _id?: ObjectId
    user_id: ObjectId
    rated_user_id: ObjectId
    dating_call_id: ObjectId
    review_texts: string[]
    stars_rating: number
    created_at: Date

    constructor(review: DatingReviewConstructor) {
        this._id = review._id
        this.user_id = review.user_id
        this.rated_user_id = review.rated_user_id
        this.dating_call_id = review.dating_call_id
        this.review_texts = review.review_texts
        this.stars_rating = review.stars_rating
        this.created_at = review.created_at || new Date()
    }
}
