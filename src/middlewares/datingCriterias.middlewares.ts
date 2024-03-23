import { ParamSchema, check, checkSchema } from 'express-validator'

import { Language, Sex } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { DATING_CRITERIAS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { stringEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const sexValues = stringEnumToArray(Sex)
const languageValues = stringEnumToArray(Language)

const sexSchema: ParamSchema = {
    isIn: {
        options: [sexValues],
        errorMessage: DATING_CRITERIAS_MESSAGES.SEX_IS_INVALID
    }
}

const ageRangeSchema: ParamSchema = {
    isArray: {
        errorMessage: DATING_CRITERIAS_MESSAGES.AGE_RANGE_MUST_BE_AN_ARRAY
    },
    custom: {
        options: (value: number[]) => {
            if (value.length !== 2) {
                throw new ErrorWithStatus({
                    message: DATING_CRITERIAS_MESSAGES.AGE_RANGE_MUST_HAVE_2_ELEMENTS,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            if (value[0] < 18 || value[1] > 65) {
                throw new ErrorWithStatus({
                    message: DATING_CRITERIAS_MESSAGES.AGE_RANGE_MUST_BE_FROM_18_TO_65,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            return true
        }
    }
}

const heightRangeSchema: ParamSchema = {
    isArray: {
        errorMessage: DATING_CRITERIAS_MESSAGES.HEIGHT_RANGE_MUST_BE_AN_ARRAY
    },
    custom: {
        options: (value: number[]) => {
            if (value.length !== 2) {
                throw new ErrorWithStatus({
                    message: DATING_CRITERIAS_MESSAGES.HEIGHT_RANGE_MUST_HAVE_2_ELEMENTS,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            if (value[0] < 140 || value[1] > 220) {
                throw new ErrorWithStatus({
                    message: DATING_CRITERIAS_MESSAGES.HEIGHT_RANGE_MUST_BE_FROM_140_TO_220,
                    status: HTTP_STATUS.BAD_REQUEST
                })
            }

            return true
        }
    }
}

const hometownSchema: ParamSchema = {
    isString: {
        errorMessage: DATING_CRITERIAS_MESSAGES.HOMETOWN_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
        options: {
            min: 1,
            max: 100
        },
        errorMessage: DATING_CRITERIAS_MESSAGES.HOMETOWN_LENGTH_MUST_BE_FROM_1_TO_100
    }
}

const languageSchema: ParamSchema = {
    isIn: {
        options: [languageValues],
        errorMessage: DATING_CRITERIAS_MESSAGES.LANGUAGE_IS_INVALID
    }
}

export const createDatingCriteriaValidator = validate(
    checkSchema(
        {
            sex: sexSchema,
            age_range: ageRangeSchema,
            height_range: heightRangeSchema,
            hometown: hometownSchema,
            language: languageSchema
        },
        ['body']
    )
)

export const updateDatingCriteriaValidator = validate(
    checkSchema(
        {
            sex: {
                ...sexSchema,
                optional: true
            },
            age_range: {
                ...ageRangeSchema,
                optional: true
            },
            height_range: {
                ...heightRangeSchema,
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
