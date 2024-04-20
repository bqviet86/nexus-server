import { Router } from 'express'

import {
    cancelFriendRequestController,
    changePasswordController,
    getAllFriendRequestsController,
    getAllFriendSuggestionsController,
    getAllFriendsController,
    getAllStatsController,
    getAllUsersController,
    getMeController,
    getProfileController,
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
    responseFriendRequestController,
    sendFriendRequestController,
    updateAvatarController,
    updateIsActiveController,
    updateMeController
} from '~/controllers/users.controllers'
import { filterMiddleware, paginationValidator } from '~/middlewares/common.middlewares'
import {
    accessTokenValidator,
    cancelFriendRequestValidator,
    changePasswordValidator,
    getAllFriendsValidator,
    getAllUsersValidator,
    getProfileValidator,
    isAdminValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    responseFriendRequestValidator,
    sendFriendRequestValidator,
    updateIsActiveValidator,
    updateMeValidator
} from '~/middlewares/users.middlewares'
import { UpdateIsActiveReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
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
 * Description: Get profile
 * Path: /:profile_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { profile_id: string }
 */
usersRouter.get('/:profile_id', accessTokenValidator, getProfileValidator, wrapRequestHandler(getProfileController))

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
 * Description: Cancel friend request
 * Path: /friend/request/:user_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { user_id: string }
 */
usersRouter.delete(
    '/friend/request/:user_id',
    accessTokenValidator,
    cancelFriendRequestValidator,
    wrapRequestHandler(cancelFriendRequestController)
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

/**
 * Description: Get all friends
 * Path: /friend/all/:user_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { user_id: string }
 */
usersRouter.get(
    '/friend/all/:user_id',
    accessTokenValidator,
    getAllFriendsValidator,
    wrapRequestHandler(getAllFriendsController)
)

// Admin routes

/**
 * Description: Get all stats
 * Path: /admin/stats
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/admin/stats', accessTokenValidator, isAdminValidator, wrapRequestHandler(getAllStatsController))

/**
 * Description: Get all users
 * Path: /admin/all-users
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { name?: string, is_active?: boolean, page: number, limit: number }
 */
usersRouter.get(
    '/admin/all-users',
    accessTokenValidator,
    isAdminValidator,
    getAllUsersValidator,
    paginationValidator,
    wrapRequestHandler(getAllUsersController)
)

/**
 * Description: Update user is_active
 * Path: /admin/update-active-status/:user_id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { user_id: string }
 * Body: { is_active: boolean }
 */
usersRouter.patch(
    '/admin/update-active-status/:user_id',
    accessTokenValidator,
    isAdminValidator,
    updateIsActiveValidator,
    filterMiddleware<UpdateIsActiveReqBody>(['is_active']),
    wrapRequestHandler(updateIsActiveController)
)

export default usersRouter
