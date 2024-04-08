import { Router } from 'express'

import { accessTokenValidator } from '~/middlewares/users.middlewares'
import databaseService from '~/services/database.services'
import { wrapRequestHandler } from '~/utils/handlers'

const provincesRouter = Router()

/**
 * Description: Get provinces
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
provincesRouter.get(
    '/',
    accessTokenValidator,
    wrapRequestHandler(async (req, res) => {
        const provinces = await databaseService.provinces
            .find(
                {},
                {
                    sort: { province_name: 1 }
                }
            )
            .toArray()

        return res.json({
            message: 'Lấy danh sách tỉnh thành thành công',
            result: provinces
        })
    })
)

export default provincesRouter
