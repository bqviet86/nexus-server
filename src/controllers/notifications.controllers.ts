import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import {
    DeleteNotificationReqParams,
    GetAllNotificationsReqQuery,
    UpdateAllNotificationReqBody,
    UpdateNotificationReqBody,
    UpdateNotificationReqParams
} from '~/models/requests/Notification.requests'
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
            total_pages: Math.ceil(total_notifications / limit)
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

export const updateNotificationController = async (
    req: Request<UpdateNotificationReqParams, any, UpdateNotificationReqBody>,
    res: Response
) => {
    const { notification_id } = req.params
    const { is_read } = req.body
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.updateNotification({ notification_id, user_id, is_read })

    return res.json(result)
}

export const updateAllNotificationController = async (
    req: Request<ParamsDictionary, any, UpdateAllNotificationReqBody>,
    res: Response
) => {
    const { is_read } = req.body
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.updateAllNotification({ user_id, is_read })

    return res.json(result)
}

export const deleteNotificationController = async (req: Request<DeleteNotificationReqParams>, res: Response) => {
    const { notification_id } = req.params
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await notificationService.deleteNotification({ notification_id, user_id })

    return res.json(result)
}
