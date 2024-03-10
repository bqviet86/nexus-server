import { MediaTypes } from '~/constants/enums'
import { Media } from '~/models/Types'
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
