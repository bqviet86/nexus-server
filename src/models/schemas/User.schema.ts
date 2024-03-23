import { ObjectId } from 'mongodb'

import { UserRole, Sex } from '~/constants/enums'

interface UserConstructor {
    _id?: ObjectId
    name: string
    email: string
    date_of_birth: Date
    sex: Sex
    phone_number: string
    password: string
    role?: UserRole
    avatar?: string
    created_at?: Date
    updated_at?: Date
}

export default class User {
    _id?: ObjectId
    name: string
    email: string
    date_of_birth: Date
    sex: Sex
    phone_number: string
    password: string
    role: UserRole
    avatar: string
    created_at: Date
    updated_at: Date

    constructor(user: UserConstructor) {
        const date = new Date()

        this._id = user._id
        this.name = user.name
        this.email = user.email
        this.date_of_birth = user.date_of_birth
        this.sex = user.sex
        this.phone_number = user.phone_number
        this.password = user.password
        this.role = user.role || UserRole.User
        this.avatar = user.avatar || ''
        this.created_at = user.created_at || date
        this.updated_at = user.updated_at || date
    }
}
