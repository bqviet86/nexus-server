import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'

import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Post from '~/models/schemas/Post.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Notification from '~/models/schemas/Notification.schema'
import Friend from '~/models/schemas/Friend.schema'
import Comment from '~/models/schemas/Comment.schema'
import Like from '~/models/schemas/Like.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import DatingCriteria from '~/models/schemas/DatingCriteria.schema'
import Province from '~/models/schemas/Province.schema'
import MBTIQuestion from '~/models/schemas/MBTIQuestion.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'

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

    get comments(): Collection<Comment> {
        return this.db.collection(process.env.DB_COMMENTS_COLLECTION as string)
    }

    get likes(): Collection<Like> {
        return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
    }

    get datingUsers(): Collection<DatingUser> {
        return this.db.collection(process.env.DB_DATING_USERS_COLLECTION as string)
    }

    get datingCriterias(): Collection<DatingCriteria> {
        return this.db.collection(process.env.DB_DATING_CRITERIAS_COLLECTION as string)
    }

    get provinces(): Collection<Province> {
        return this.db.collection(process.env.DB_PROVINCES_COLLECTION as string)
    }

    get mbtiQuestions(): Collection<MBTIQuestion> {
        return this.db.collection(process.env.DB_MBTI_QUESTIONS_COLLECTION as string)
    }

    get mbtiTests(): Collection<MBTITest> {
        return this.db.collection(process.env.DB_MBTI_TESTS_COLLECTION as string)
    }
}

const databaseService = new DatabaseService()

export default databaseService
