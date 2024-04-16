export interface CreateDatingCallReqBody {
    first_user_id: string
    second_user_id: string
    constructive_result_id?: string
    duration: number
}

export interface GetAllDatingCallsReqQuery {
    dating_profile_id?: string
}
