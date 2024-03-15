import { Router } from 'express'

import {
    changePasswordController,
    getAllFriendRequestsController,
    getAllFriendSuggestionsController,
    getMeController,
    loginAdminController,
    loginController,
    logoutAdminController,
    logoutController,
    refreshTokenController,
    registerController,
    responseFriendRequestController,
    sendFriendRequestController,
    updateAvatarController,
    updateMeController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
    accessTokenValidator,
    changePasswordValidator,
    isAdminValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    responseFriendRequestValidator,
    sendFriendRequestValidator,
    updateMeValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {
 *    name: string,
 *    email: string,
 *    password: string,
 *    confirm_password: string,
 *    date_of_birth: ISO8601,
 *    sex: Sex,
 *    phone_number: string
 * }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login a user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Logout a user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Get my info
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Update my avatar
 * Path: /avatar
 * Method: PATCH
 * Body: { image: max 1 file }
 */
usersRouter.patch('/avatar', accessTokenValidator, wrapRequestHandler(updateAvatarController))

/**
 * Description: Update my info
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UpdateMeReqBody
 */
usersRouter.patch(
    '/me',
    accessTokenValidator,
    updateMeValidator,
    filterMiddleware<UpdateMeReqBody>(['name', 'email', 'date_of_birth', 'sex', 'phone_number']),
    wrapRequestHandler(updateMeController)
)

/**
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * Body: { old_password: string, password: string, confirm_password: string }
 */
usersRouter.put(
    '/change-password',
    accessTokenValidator,
    changePasswordValidator,
    wrapRequestHandler(changePasswordController)
)

/**
 * Description: Send friend request
 * Path: /friend/request/:user_to_id
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.post(
    '/friend/request/:user_to_id',
    accessTokenValidator,
    sendFriendRequestValidator,
    wrapRequestHandler(sendFriendRequestController)
)

/**
 * Description: Response friend request
 * Path: /friend/response/:user_from_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: { status: FriendStatus }
 */
usersRouter.patch(
    '/friend/response/:user_from_id',
    accessTokenValidator,
    responseFriendRequestValidator,
    wrapRequestHandler(responseFriendRequestController)
)

/**
 * Description: Get all friend requests
 * Path: /friend/request
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/friend/request', accessTokenValidator, wrapRequestHandler(getAllFriendRequestsController))

/**
 * Description: Get all friend suggestions
 * Path: /friend/suggestion
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/friend/suggestion', accessTokenValidator, wrapRequestHandler(getAllFriendSuggestionsController))

// Admin routes

/**
 * Description: Login admin
 * Path: /admin/login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/admin/login', loginValidator, wrapRequestHandler(loginAdminController))

/**
 * Description: Logout admin
 * Path: /admin/logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
    '/admin/logout',
    accessTokenValidator,
    refreshTokenValidator,
    isAdminValidator,
    wrapRequestHandler(logoutAdminController)
)

export default usersRouter
