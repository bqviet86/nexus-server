import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'

import { envConfig } from '~/constants/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Post from '~/models/schemas/Post.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Notification from '~/models/schemas/Notification.schema'
import Friend from '~/models/schemas/Friend.schema'
import Comment from '~/models/schemas/Comment.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import DatingUser from '~/models/schemas/DatingUser.schema'
import DatingCriteria from '~/models/schemas/DatingCriteria.schema'
import Province from '~/models/schemas/Province.schema'
import MBTIQuestion from '~/models/schemas/MBTIQuestion.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'
import ConstructiveQuestion from '~/models/schemas/ConstructiveQuestion.schema'
import ConstructiveResult from '~/models/schemas/ConstructiveResult.schema'
import DatingCall from '~/models/schemas/DatingCall.schema'
import DatingReview from '~/models/schemas/DatingReview.schema'
import DatingConversation from '~/models/schemas/DatingConversation.schema'

config()

const uri = envConfig.mongoDbUri

class DatabaseService {
    private client: MongoClient
    private db: Db

    constructor() {
        this.client = new MongoClient(uri)
        this.db = this.client.db(envConfig.mongoDbName)
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
        return this.db.collection(envConfig.dbUsersCollection)
    }

    get refreshTokens(): Collection<RefreshToken> {
        return this.db.collection(envConfig.dbRefreshTokensCollection)
    }

    get posts(): Collection<Post> {
        return this.db.collection(envConfig.dbPostsCollection)
    }

    get hashtags(): Collection<Hashtag> {
        return this.db.collection(envConfig.dbHashtagsCollection)
    }

    get videoStatus(): Collection<VideoStatus> {
        return this.db.collection(envConfig.dbVideoStatusCollection)
    }

    get notifications(): Collection<Notification> {
        return this.db.collection(envConfig.dbNotificationsCollection)
    }

    get friends(): Collection<Friend> {
        return this.db.collection(envConfig.dbFriendsCollection)
    }

    get comments(): Collection<Comment> {
        return this.db.collection(envConfig.dbCommentsCollection)
    }

    get likes(): Collection<Like> {
        return this.db.collection(envConfig.dbLikesCollection)
    }

    get conversations(): Collection<Conversation> {
        return this.db.collection(envConfig.dbConversationsCollection)
    }

    get datingUsers(): Collection<DatingUser> {
        return this.db.collection(envConfig.dbDatingUsersCollection)
    }

    get datingCriterias(): Collection<DatingCriteria> {
        return this.db.collection(envConfig.dbDatingCriteriasCollection)
    }

    get provinces(): Collection<Province> {
        return this.db.collection(envConfig.dbProvincesCollection)
    }

    get mbtiQuestions(): Collection<MBTIQuestion> {
        return this.db.collection(envConfig.dbMbtiQuestionsCollection)
    }

    get mbtiTests(): Collection<MBTITest> {
        return this.db.collection(envConfig.dbMbtiTestsCollection)
    }

    get constructiveQuestions(): Collection<ConstructiveQuestion> {
        return this.db.collection(envConfig.dbConstructiveQuestionsCollection)
    }

    get constructiveResults(): Collection<ConstructiveResult> {
        return this.db.collection(envConfig.dbConstructiveResultsCollection)
    }

    get datingCalls(): Collection<DatingCall> {
        return this.db.collection(envConfig.dbDatingCallsCollection)
    }

    get datingReviews(): Collection<DatingReview> {
        return this.db.collection(envConfig.dbDatingReviewsCollection)
    }

    get datingConversations(): Collection<DatingConversation> {
        return this.db.collection(envConfig.dbDatingConversationsCollection)
    }
}

const databaseService = new DatabaseService()

export default databaseService
