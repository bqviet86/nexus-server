import { Router } from 'express'

import { uploadImageController, uploadVideoHLSController } from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Upload image
 * Path: /upload-image
 * Method: POST
 * Body: { image: max 4 files }
 */
mediasRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))

/**
 * Description: Upload video HLS
 * Path: /upload-video-hls
 * Method: POST
 * Body: { video: only 1 file }
 */
mediasRouter.post('/upload-video-hls', accessTokenValidator, wrapRequestHandler(uploadVideoHLSController))

export default mediasRouter
