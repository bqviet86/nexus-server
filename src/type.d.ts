import { Request } from 'express'

import { TokenPayload } from './models/requests/User.requests'
import User from './models/schemas/User.schema'
import Friend from './models/schemas/Friend.schema'
import Post from './models/schemas/Post.schema'
import DatingUser from './models/schemas/DatingUser.schema'
import MBTIQuestion from './models/schemas/MBTIQuestion.schema'
import MBTITest from './models/schemas/MBTITest.schema'

declare module 'express' {
    interface Request {
        user?: User
        friend?: Friend
        decoded_authorization?: TokenPayload
        decoded_refresh_token?: TokenPayload
        post?: Post
        parent_post?: Post
        dating_profile?: DatingUser
        mbti_question?: MBTIQuestion
        mbti_test?: MBTITest
    }
}
