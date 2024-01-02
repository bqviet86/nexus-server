export const numberEnumToArray = (numberEnum: { [key: string]: any }) => {
    return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const stringEnumToArray = (stringEnum: { [key: string]: any }) => {
    return Object.values(stringEnum).filter((value) => typeof value === 'string') as string[]
}
