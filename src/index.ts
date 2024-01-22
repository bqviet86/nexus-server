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
app.use('/static', staticRouter)

// Error handler
app.use(defaultErrorHandler)

// Socket
initSocket(httpServer)

// Listen
httpServer.listen(port, () => console.log(`Listen on http://localhost:${port}`))
