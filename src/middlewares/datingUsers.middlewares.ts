import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { Language, Sex } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { DATING_USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const sexValues = stringEnumToArray(Sex)
const languageValues = stringEnumToArray(Language)

const nameSchema: ParamSchema = {
    notEmpty: {
        errorMessage: DATING_USERS_MESSAGES.NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: DATING_USERS_MESSAGES.NAME_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: DATING_USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
}

const sexSchema: ParamSchema = {
    isIn: {
        options: [sexValues],
        errorMessage: DATING_USERS_MESSAGES.SEX_IS_INVALID
    }
}

const ageSchema: ParamSchema = {
    isInt: {
        options: {
            min: 18,
            max: 65
        }
    }
}

const heightSchema: ParamSchema = {
    isInt: {
        options: {
            min: 140,
            max: 220
        }
    }
}

const hometownSchema: ParamSchema = {
    notEmpty: {
        errorMessage: DATING_USERS_MESSAGES.HOMETOWN_IS_REQUIRED
    },
    isString: {
        errorMessage: DATING_USERS_MESSAGES.HOMETOWN_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: DATING_USERS_MESSAGES.HOMETOWN_LENGTH_MUST_BE_FROM_1_TO_100
    }
}

const languageSchema: ParamSchema = {
    isIn: {
        options: [languageValues],
        errorMessage: DATING_USERS_MESSAGES.LANGUAGE_IS_INVALID
    }
}

export const getDatingProfileValidator = validate(
    checkSchema(
        {
            id: {
                trim: true,
                custom: {
                    options: async (value: string, { req }) => {
                        if (!ObjectId.isValid(value)) {
                            throw new ErrorWithStatus({
                                message: DATING_USERS_MESSAGES.ID_IS_INVALID,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }

                        const checkId = (req as Request).query.checkId as 'user_id' | 'dating_user_id'
                        const datingProfile = await databaseService.datingUsers.findOne(
                            {
                                ...(checkId === 'user_id'
                                    ? { user_id: new ObjectId(value) }
                                    : { _id: new ObjectId(value) })
                            },
                            {
                                projection: {
                                    user_id: 0
                                }
                            }
                        )

                        if (datingProfile === null) {
                            throw new ErrorWithStatus({
                                message: DATING_USERS_MESSAGES.DATING_PROFILE_NOT_FOUND,
                                status: HTTP_STATUS.NOT_FOUND
                            })
                        }

                        ;(req as Request).dating_profile = datingProfile

                        return true
                    }
                }
            },
            checkId: {
                isIn: {
                    options: [['user_id', 'dating_user_id']],
                    errorMessage: DATING_USERS_MESSAGES.CHECK_ID_IS_INVALID
                }
            }
        },
        ['params', 'query']
    )
)

export const createDatingProfileValidator = validate(
    checkSchema(
        {
            name: nameSchema,
            sex: sexSchema,
            age: ageSchema,
            height: heightSchema,
            hometown: hometownSchema,
            language: languageSchema
        },
        ['body']
    )
)

export const updateDatingProfileValidator = validate(
    checkSchema(
        {
            name: {
                ...nameSchema,
                optional: true
            },
            sex: {
                ...sexSchema,
                optional: true
            },
            age: {
                ...ageSchema,
                optional: true
            },
            height: {
                ...heightSchema,
                optional: true
            },
            hometown: {
                ...hometownSchema,
                optional: true
            },
            language: {
                ...languageSchema,
                optional: true
            }
        },
        ['body']
    )
)
