import { checkSchema } from 'express-validator'

import { postIdSchema } from './common.middlewares'
import { validate } from '~/utils/validation'

export const likePostValidator = validate(
    checkSchema(
        {
            post_id: postIdSchema
        },
        ['body']
    )
)

export const unlikePostValidator = validate(
    checkSchema(
        {
            post_id: postIdSchema
        },
        ['params']
    )
)
