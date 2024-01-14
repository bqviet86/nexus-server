import { Request, Response } from 'express'

import { MEDIAS_MESSAGES } from '~/constants/messages'
import { GetVideoStatusReqParams } from '~/models/requests/VideoStatus.requests'
import mediaService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response) => {
    const data = await mediaService.uploadImage({ req, maxFiles: 5 })

    return res.json({
        message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
        result: data
    })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
    const data = await mediaService.uploadVideoHLS({ req, maxFiles: 1 })

    return res.json({
        message: MEDIAS_MESSAGES.UPLOAD_VIDEO_HLS_SUCCESS,
        result: data
    })
}

export const getVideoStatusController = async (req: Request<GetVideoStatusReqParams>, res: Response) => {
    const { idName } = req.params
    const result = await mediaService.getVideoStatus(idName as string)

    return res.json({
        message: MEDIAS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
        result
    })
}
