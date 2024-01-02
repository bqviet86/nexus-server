import { MediaTypes } from '~/constants/enums'
import { Media } from '~/models/Others'
import { numberEnumToArray, stringEnumToArray } from './commons'

export const isMedia = (variable: any): variable is Media => {
    const mediaTypes = stringEnumToArray(MediaTypes)

    return (
        typeof variable === 'object' &&
        typeof variable.url === 'string' &&
        typeof variable.type === 'string' &&
        mediaTypes.includes(variable.type)
    )
}
