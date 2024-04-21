import { MBTIValue, MediaTypes } from '~/constants/enums'
import { MBTIOption, Media } from '~/models/Types'
import { stringEnumToArray } from './commons'

export const isMedia = (variable: any): variable is Media => {
    const mediaTypes = stringEnumToArray(MediaTypes)

    return (
        typeof variable === 'object' &&
        typeof variable?.url === 'string' &&
        typeof variable?.type === 'string' &&
        mediaTypes.includes(variable?.type)
    )
}

export const isMBTIOption = (variable: any): variable is MBTIOption => {
    const mbtiValues = stringEnumToArray(MBTIValue)

    return (
        typeof variable === 'object' &&
        typeof variable?.option === 'string' &&
        typeof variable?.dimension_value === 'string' &&
        mbtiValues.includes(variable?.dimension_value)
    )
}
