import { ObjectId } from 'mongodb'

import { Sex, Language } from '~/constants/enums'
import { Media } from '../Types'

interface DatingUserConstructor {
    _id?: ObjectId
    user_id: ObjectId
    name: string
    sex: Sex
    age: number
    height: number
    hometown: string
    language: Language
    avatar?: string
    images?: Media[]
    created_at?: Date
    updated_at?: Date
}

export default class DatingUser {
    _id?: ObjectId
    user_id: ObjectId
    name: string
    sex: Sex
    age: number
    height: number
    hometown: string
    language: Language
    avatar: string
    images: Media[]
    created_at: Date
    updated_at: Date

    constructor(user: DatingUserConstructor) {
        const date = new Date()

        this._id = user._id
        this.user_id = user.user_id
        this.name = user.name
        this.sex = user.sex
        this.age = user.age
        this.height = user.height
        this.hometown = user.hometown
        this.language = user.language
        this.avatar = user.avatar || ''
        this.images = user.images || []
        this.created_at = user.created_at || date
        this.updated_at = user.updated_at || date
    }
}
