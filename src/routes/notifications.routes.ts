import { Router } from 'express'

import {
    getAllNotificationsController,
    getUnreadNotificationsController,
    readAllNotificationsController,
    readNotificationController
} from '~/controllers/notifications.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import { getAllNotificationsValidator, readNotificationValidator } from '~/middlewares/notifications.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const notificationsRouter = Router()

/**
 * Description: Get all notifications
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: {
 *     page: '1',
 *     limit: '10',
 *     tag?: 'all' | 'read' | 'unread'
 * }
 */
notificationsRouter.get(
    '/',
    accessTokenValidator,
    paginationValidator,
    getAllNotificationsValidator,
    wrapRequestHandler(getAllNotificationsController)
)

/**
 * Description: Get unread notifications
 * Path: /unread
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
notificationsRouter.get('/unread', accessTokenValidator, wrapRequestHandler(getUnreadNotificationsController))

notificationsRouter.patch(
    '/read/:notification_id',
    accessTokenValidator,
    readNotificationValidator,
    wrapRequestHandler(readNotificationController)
)

/**
 * Description: Read all notifications
 * Path: /read-all
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 */
notificationsRouter.patch('/read-all', accessTokenValidator, wrapRequestHandler(readAllNotificationsController))

export default notificationsRouter
