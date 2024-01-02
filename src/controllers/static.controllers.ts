import { Request, Response } from 'express'

import { sendFileFromS3 } from '~/utils/s3'

export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params

    sendFileFromS3(res, `images/${name}`)
}

export const serveM3u8Controller = (req: Request, res: Response) => {
    const { id } = req.params

    sendFileFromS3(res, `videos-hls/${id}/master.m3u8`)
}

export const serveSegmentController = (req: Request, res: Response) => {
    const { id, v, segment } = req.params

    sendFileFromS3(res, `videos-hls/${id}/${v}/${segment}`)
}
