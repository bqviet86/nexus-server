import { checkSchema } from 'express-validator'

import { validate } from '~/utils/validation'

export const createDatingReviewValidator = validate(
    checkSchema(
        {
            user_id: {
                in: ['body'],
                isString: true,
                isMongoId: true,
                errorMessage: 'User ID must be a valid MongoDB ID'
            },
            rated_user_id: {
                in: ['body'],
                isString: true,
                isMongoId: true,
                errorMessage: 'Rated user ID must be a valid MongoDB ID'
            },
            dating_call_id: {
                in: ['body'],
                isString: true,
                isMongoId: true,
                errorMessage: 'Dating call ID must be a valid MongoDB ID'
            },
            review_texts: {
                in: ['body'],
                isArray: true,
                errorMessage: 'Review texts must be an array of strings'
            },
            stars_rating: {
                in: ['body'],
                isInt: {
                    options: { min: 1, max: 5 }
                },
                errorMessage: 'Stars rating must be an integer between 1 and 5'
            }
        },
        ['body']
    )
)
