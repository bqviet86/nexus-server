import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = process.env.NODE_ENV
const envFilename = `.env.${env}`

if (!env) {
    console.log(`You haven't provided NODE_ENV environment variable (e.g: development, production)`)
    console.log(`NODE_ENV = '${env}'`)
    process.exit(1)
}

if (!fs.existsSync(path.resolve(envFilename))) {
    console.log(`Cannot find ${envFilename} file`)
    process.exit(1)
}

console.log(`NODE_ENV = '${env}', app will use ${envFilename} file`)

config({
    path: envFilename
})

export const isProduction = env === 'production'

export const envConfig = {
    // Server info
    port: process.env.PORT || 4000,
    clientUrl: process.env.CLIENT_URL as string,
    host: process.env.HOST as string,

    // Database info
    mongoDbName: process.env.MONGO_DB_NAME as string,
    mongoDbUri: process.env.MONGO_DB_URI as string,

    // Collections
    dbUsersCollection: process.env.DB_USERS_COLLECTION as string,
    dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
    dbPostsCollection: process.env.DB_POSTS_COLLECTION as string,
    dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION as string,
    dbVideoStatusCollection: process.env.DB_VIDEO_STATUS_COLLECTION as string,
    dbNotificationsCollection: process.env.DB_NOTIFICATIONS_COLLECTION as string,
    dbFriendsCollection: process.env.DB_FRIENDS_COLLECTION as string,
    dbCommentsCollection: process.env.DB_COMMENTS_COLLECTION as string,
    dbLikesCollection: process.env.DB_LIKES_COLLECTION as string,
    dbConversationsCollection: process.env.DB_CONVERSATIONS_COLLECTION as string,
    dbDatingUsersCollection: process.env.DB_DATING_USERS_COLLECTION as string,
    dbDatingCriteriasCollection: process.env.DB_DATING_CRITERIAS_COLLECTION as string,
    dbProvincesCollection: process.env.DB_PROVINCES_COLLECTION as string,
    dbMbtiQuestionsCollection: process.env.DB_MBTI_QUESTIONS_COLLECTION as string,
    dbMbtiTestsCollection: process.env.DB_MBTI_TESTS_COLLECTION as string,
    dbConstructiveQuestionsCollection: process.env.DB_CONSTRUCTIVE_QUESTIONS_COLLECTION as string,
    dbConstructiveResultsCollection: process.env.DB_CONSTRUCTIVE_RESULTS_COLLECTION as string,
    dbDatingCallsCollection: process.env.DB_DATING_CALLS_COLLECTION as string,
    dbDatingReviewsCollection: process.env.DB_DATING_REVIEWS_COLLECTION as string,
    dbDatingConversationsCollection: process.env.DB_DATING_CONVERSATIONS_COLLECTION as string,

    // Secret
    passwordSecret: process.env.PASSWORD_SECRET as string,
    jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
    jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,

    // Token expire time
    accessTokenExpireIn: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
    refreshTokenExpireIn: process.env.REFRESH_TOKEN_EXPIRE_IN as string,

    // AWS
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    awsRegion: process.env.AWS_REGION as string,

    // AWS S3
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME as string
}
