import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'

import { FriendStatus, Sex, UserRole } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { LoginReqBody, TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { stringEnumToArray, verifyAccessToken } from '~/utils/commons'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

config()

const sexValues = stringEnumToArray(Sex)

const friendStatusValues = stringEnumToArray(FriendStatus)

// Lỗi mặc định 422, muón lỗi khác thì dùng ErrorWithStatus
const nameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
}

const emailSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
    },
    isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
    },
    trim: true
}

const passwordSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
        options: {
            min: 6,
            max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
    }
}

const confirmPasswordSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
    },
    isLength: {
        options: {
            min: 6,
            max: 50
        },
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
        options: (value: string, { req }) => {
            if (value !== req.body.password) {
                throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }

            return true
        }
    }
}

const dateOfBirthSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
    },
    isISO8601: {
        options: {
            strict: true,
            strictSeparator: true
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
    }
}

const sexSchema: ParamSchema = {
    isIn: {
        options: [sexValues],
        errorMessage: USERS_MESSAGES.SEX_IS_INVALID
    }
}

const phoneNumberSchema: ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED
    },
    isMobilePhone: {
        options: ['vi-VN'],
        errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_INVALID
    },
    trim: true
}

const userIdSchema: ParamSchema = {
    trim: true,
    custom: {
        options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload

            if (!ObjectId.isValid(value) || value === user_id) {
                throw new ErrorWithStatus({
                    message: USERS_MESSAGES.USER_ID_IS_INVALID,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            const user = await databaseService.users.findOne({
                _id: new ObjectId(value)
            })

            if (user === null) {
                throw new ErrorWithStatus({
                    message: USERS_MESSAGES.USER_NOT_FOUND,
                    status: HTTP_STATUS.NOT_FOUND
                })
            }

            return true
        }
    }
}

export const registerValidator = validate(
    checkSchema(
        {
            name: nameSchema,
            email: {
                ...emailSchema,
                custom: {
                    options: async (value: string) => {
                        const isExistEmail = await usersServices.checkEmailExist(value)

                        if (isExistEmail) {
                            throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
                        }

                        return true
                    }
                }
            },
            password: passwordSchema,
            confirm_password: confirmPasswordSchema,
            date_of_birth: dateOfBirthSchema,
            sex: sexSchema,
            phone_number: phoneNumberSchema
        },
        ['body']
    )
)

export const loginValidator = validate(
    checkSchema(
        {
            email: {
                ...emailSchema,
                custom: {
                    options: async (value: string, { req }) => {
                        const user = await databaseService.users.findOne({
                            email: value
                        })

                        if (user === null) {
                            throw new Error(USERS_MESSAGES.YOU_HAVE_NOT_REGISTERED_WITH_THIS_EMAIL)
                        }

                        ;(req as Request).user = user

                        return true
                    }
                }
            },
            password: {
                ...passwordSchema,
                custom: {
                    options: async (value: string, { req }) => {
                        const { email } = (req as Request<ParamsDictionary, any, LoginReqBody>).body
                        const user = await databaseService.users.findOne({ email })

                        if (user && hashPassword(value) !== user.password) {
                            throw new Error(USERS_MESSAGES.INCORRECT_PASSWORD)
                        }

                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const accessTokenValidator = validate(
    checkSchema(
        {
            Authorization: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        const access_token = (value || '').split(' ')[1]
                        return verifyAccessToken(access_token, req as Request)
                    }
                }
            }
        },
        ['headers']
    )
)

export const refreshTokenValidator = validate(
    checkSchema(
        {
            refresh_token: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!value) {
                            throw new ErrorWithStatus({
                                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                                status: HTTP_STATUS.UNAUTHORIZED
                            })
                        }

                        try {
                            const [decoded_refresh_token, refresh_token] = await Promise.all([
                                verifyToken({
                                    token: value,
                                    secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                                }),
                                databaseService.refreshTokens.findOne({ token: value })
                            ])

                            if (refresh_token === null) {
                                throw new ErrorWithStatus({
                                    message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                                    status: HTTP_STATUS.UNAUTHORIZED
                                })
                            }

                            ;(req as Request).decoded_refresh_token = decoded_refresh_token
                        } catch (error) {
                            if (error instanceof JsonWebTokenError) {
                                throw new ErrorWithStatus({
                                    message: capitalize(error.message),
                                    status: HTTP_STATUS.UNAUTHORIZED
                                })
                            }

                            throw error
                        }

                        return true
                    }
                }
            }
        },
        ['body']
    )
)

export const updateMeValidator = validate(
    checkSchema(
        {
            name: {
                ...nameSchema,
                optional: true
            },
            email: {
                ...emailSchema,
                optional: true
            },
            date_of_birth: {
                ...dateOfBirthSchema,
                optional: true
            },
            sex: {
                ...sexSchema,
                optional: true
            },
            phone_number: {
                ...phoneNumberSchema,
                optional: true
            }
        },
        ['body']
    )
)

export const changePasswordValidator = validate(
    checkSchema(
        {
            old_password: {
                ...passwordSchema,
                custom: {
                    options: async (value: string, { req }) => {
                        const { user_id } = req.decoded_authorization as TokenPayload
                        const user = await databaseService.users.findOne({
                            _id: new ObjectId(user_id)
                        })

                        if (user === null) {
                            throw new ErrorWithStatus({
                                message: USERS_MESSAGES.USER_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        if (hashPassword(value) !== user.password) {
                            throw new ErrorWithStatus({
                                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                                status: HTTP_STATUS.UNAUTHORIZED
                            })
                        }

                        return true
                    }
                }
            },
            password: passwordSchema,
            confirm_password: confirmPasswordSchema
        },
        ['body']
    )
)

export const sendFriendRequestValidator = validate(
    checkSchema(
        {
            user_to_id: userIdSchema
        },
        ['params']
    )
)

export const responseFriendRequestValidator = validate(
    checkSchema(
        {
            user_from_id: userIdSchema,
            status: {
                isIn: {
                    options: [friendStatusValues.filter((status) => status !== FriendStatus.Pending)],
                    errorMessage: USERS_MESSAGES.FRIEND_STATUS_IS_INVALID
                }
            }
        },
        ['params', 'body']
    )
)

export const isAdminValidator = (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.decoded_authorization as TokenPayload

    if (role !== UserRole.Admin) {
        return next(
            new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_ADMIN,
                status: HTTP_STATUS.FORBIDDEN
            })
        )
    }

    next()
}
