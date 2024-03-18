import { Request } from 'express'

import { TokenPayload } from './models/requests/User.requests'
import User from './models/schemas/User.schema'
import Friend from './models/schemas/Friend.schema'
import Post from './models/schemas/Post.schema'

declare module 'express' {
    interface Request {
        user?: User
        friend?: Friend
        decoded_authorization?: TokenPayload
        decoded_refresh_token?: TokenPayload
        post?: Post
        parent_post?: Post
    }
}
