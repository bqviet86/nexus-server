import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'

import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Post from '~/models/schemas/Post.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Notification from '~/models/schemas/Notification.schema'
import Friend from '~/models/schemas/Friend.schema'

config()

const uri = process.env.MONGO_DB_URI as string

class DatabaseService {
    private client: MongoClient
    private db: Db

    constructor() {
        this.client = new MongoClient(uri)
        this.db = this.client.db(process.env.MONGO_DB_NAME)
    }

    async connect() {
        try {
            await this.db.command({ ping: 1 })
            console.log('Pinged your deployment. You successfully connected to MongoDB!')
        } catch (error) {
            console.log(error)
        }
    }

    get users(): Collection<User> {
        return this.db.collection(process.env.DB_USERS_COLLECTION as string)
    }

    get refreshTokens(): Collection<RefreshToken> {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
    }

    get posts(): Collection<Post> {
        return this.db.collection(process.env.DB_POSTS_COLLECTION as string)
    }

    get hashtags(): Collection<Hashtag> {
        return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
    }

    get videoStatus(): Collection<VideoStatus> {
        return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
    }

    get notifications(): Collection<Notification> {
        return this.db.collection(process.env.DB_NOTIFICATIONS_COLLECTION as string)
    }

    get friends(): Collection<Friend> {
        return this.db.collection(process.env.DB_FRIENDS_COLLECTION as string)
    }
}

const databaseService = new DatabaseService()

export default databaseService
