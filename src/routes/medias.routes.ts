import { Router } from 'express'

import {
    getVideoStatusController,
    uploadImageController,
    uploadVideoHLSController
} from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Upload image
 * Path: /upload-image
 * Method: POST
 * Body: { image: max 5 files }
 */
mediasRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))

/**
 * Description: Upload video HLS
 * Path: /upload-video-hls
 * Method: POST
 * Body: { video: only 1 file }
 */
mediasRouter.post('/upload-video-hls', accessTokenValidator, wrapRequestHandler(uploadVideoHLSController))

/**
 * Description: Get video status
 * Path: /video-status/:idName
 * Method: GET
 * Params: { idName: string }
 */
mediasRouter.get('/video-status/:idName', accessTokenValidator, wrapRequestHandler(getVideoStatusController))

export default mediasRouter
