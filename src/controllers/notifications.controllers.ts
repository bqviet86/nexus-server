import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import { GetAllNotificationsReqQuery, ReadNotificationReqParams } from '~/models/requests/Notification.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import notificationService from '~/services/notifications.services'

export const getAllNotificationsController = async (
    req: Request<ParamsDictionary, any, any, GetAllNotificationsReqQuery>,
    res: Response
) => {
    const { tag } = req.query
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const { user_id } = req.decoded_authorization as TokenPayload
    const { notifications, total_notifications } = await notificationService.getAllNotifications({
        user_id,
        page,
        limit,
        tag
    })

    return res.json({
        message: NOTIFICATIONS_MESSAGES.GET_ALL_NOTIFICATIONS_SUCCESSFULLY,
        result: {
            notifications,
            page,
            limit,
            total_pages: Math.ceil(total_notifications / Number(limit))
        }
    })
}

export const getUnreadNotificationsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.getUnreadNotifications(user_id)

    return res.json({
        message: NOTIFICATIONS_MESSAGES.GET_UNREAD_NOTIFICATIONS_SUCCESSFULLY,
        result
    })
}

export const readNotificationController = async (req: Request<ReadNotificationReqParams>, res: Response) => {
    const { notification_id } = req.params
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.readNotification({ notification_id, user_id })

    return res.json(result)
}

export const readAllNotificationsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.readAllNotifications(user_id)

    return res.json(result)
}
