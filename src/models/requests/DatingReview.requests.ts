export interface CreateDatingReviewReqBody {
    user_id: string
    rated_user_id: string
    dating_call_id: string
    review_texts: string[]
    stars_rating: number
}
