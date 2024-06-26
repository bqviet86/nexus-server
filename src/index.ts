import express from 'express'
import { createServer } from 'http'
import { config } from 'dotenv'
import cors from 'cors'

import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import usersRouter from '~/routes/users.routes'
import mediasRouter from './routes/medias.routes'
import postsRouter from './routes/posts.routes'
import notificationsRouter from './routes/notifications.routes'
import commentsRouter from './routes/comments.routes'
import likesRouter from './routes/likes.routes'
import conversationsRouter from './routes/conversations.routes'
import datingUsersRouter from './routes/datingUsers.routes'
import datingCriteriasRouter from './routes/datingCriterias.routes'
import provincesRouter from './routes/provinces.routes'
import mbtiQuestionsRouter from './routes/mbtiQuestions.routes'
import mbtiTestsRouter from './routes/mbtiTests.routes'
import constructiveQuestionsRouter from './routes/constructiveQuestions.routes'
import constructiveResultsRouter from './routes/constructiveResults.routes'
import datingCallsRouter from './routes/datingCalls.routes'
import datingReviewsRouter from './routes/datingReviews.routes'
import datingConversationsRouter from './routes/datingConversations.routes'
import staticRouter from './routes/static.routes'
import databaseService from '~/services/database.services'
import { initFolder } from './utils/file'
import initSocket from './utils/socket'

config()

const port = process.env.PORT || 4000
const app = express()
const httpServer = createServer(app)

// Init folders
initFolder(UPLOAD_IMAGE_TEMP_DIR)
initFolder(UPLOAD_VIDEO_TEMP_DIR)

// Connect to database
databaseService.connect()

// Middlewares
app.use(express.json())
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
)

// Routes
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/posts', postsRouter)
app.use('/notifications', notificationsRouter)
app.use('/comments', commentsRouter)
app.use('/likes', likesRouter)
app.use('/conversations', conversationsRouter)
app.use('/dating-users', datingUsersRouter)
app.use('/dating-criterias', datingCriteriasRouter)
app.use('/provinces', provincesRouter)
app.use('/mbti-questions', mbtiQuestionsRouter)
app.use('/mbti-tests', mbtiTestsRouter)
app.use('/constructive-questions', constructiveQuestionsRouter)
app.use('/constructive-results', constructiveResultsRouter)
app.use('/dating-calls', datingCallsRouter)
app.use('/dating-reviews', datingReviewsRouter)
app.use('/dating-conversations', datingConversationsRouter)
app.use('/static', staticRouter)

// Error handler
app.use(defaultErrorHandler)

// Socket
initSocket(httpServer)

// Listen
httpServer.listen(port, () => console.log(`Listen on http://localhost:${port}`))
