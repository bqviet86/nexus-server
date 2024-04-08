import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { CreateDatingReviewReqBody } from '~/models/requests/DatingReview.requests'
import datingReviewService from '~/services/datingReviews.services'

export const createDatingReviewController = async (
    req: Request<ParamsDictionary, any, CreateDatingReviewReqBody>,
    res: Response
) => {
    const result = await datingReviewService.createDatingReview(req.body)

    return res.json({
        message: 'Dating review created successfully',
        result
    })
}
