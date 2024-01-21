import { Server as ServerHttp } from 'http'
import { Server } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'

import { TokenPayload } from '~/models/requests/User.requests'
import { verifyAccessToken } from './commons'

type UserSocket = {
    socket_ids: string[]
}

export let io: Server
export const socketUsers: Record<string, UserSocket> = {}

const initSocket = (httpServer: ServerHttp) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL
        }
    })

    io.use(async (socket, next) => {
        const Authorization = socket.handshake.auth.Authorization as string | undefined
        const access_token = Authorization?.split(' ')[1] || ''

        try {
            const decoded_authorization = await verifyAccessToken(access_token)

            socket.handshake.auth.access_token = access_token
            socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayload

            next()
        } catch (error) {
            const err = new Error('Unauthorized') as ExtendedError

            err.data = error
            next(err)
        }
    })

    io.on('connection', (socket) => {
        const { id: socketId } = socket
        const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload

        if (socketUsers[user_id]) {
            socketUsers[user_id].socket_ids.push(socketId)
        } else {
            socketUsers[user_id] = { socket_ids: [socketId] }
        }

        console.log('socketUsers', socketUsers)

        socket.use(async (_, next) => {
            const access_token = socket.handshake.auth.access_token as string

            try {
                await verifyAccessToken(access_token)
                next()
            } catch (error) {
                next(new Error('Unauthorized'))
            }
        })

        socket.on('error', (error) => {
            if (error && error.message === 'Unauthorized') {
                console.log('error', error)
                socket.disconnect()
            }
        })

        socket.on('disconnect', () => {
            socketUsers[user_id].socket_ids = socketUsers[user_id].socket_ids.filter((id) => id !== socketId)

            if (!socketUsers[user_id].socket_ids.length) {
                delete socketUsers[user_id]
            }

            console.log('socketUsers', socketUsers)
        })
    })
}

export default initSocket