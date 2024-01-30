import { Router } from 'express'

import {
    deleteNotificationController,
    getAllNotificationsController,
    getUnreadNotificationsController,
    updateAllNotificationController,
    updateNotificationController
} from '~/controllers/notifications.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
    deleteNotificationValidator,
    getAllNotificationsValidator,
    updateAllNotificationValidator,
    updateNotificationValidator
} from '~/middlewares/notifications.middlewares'
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

/**
 * Description: Update notification
 * Path: /:notification_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { notification_id: string }
 * Body: { is_read: boolean }
 */
notificationsRouter.patch(
    '/:notification_id',
    accessTokenValidator,
    updateNotificationValidator,
    wrapRequestHandler(updateNotificationController)
)

/**
 * Description: Update all notifications
 * Path: /
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: { is_read: boolean }
 */
notificationsRouter.patch(
    '/',
    accessTokenValidator,
    updateAllNotificationValidator,
    wrapRequestHandler(updateAllNotificationController)
)

/**
 * Description: Delete notification
 * Path: /:notification_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { notification_id: string }
 */
notificationsRouter.delete(
    '/:notification_id',
    accessTokenValidator,
    deleteNotificationValidator,
    wrapRequestHandler(deleteNotificationController)
)

export default notificationsRouter
