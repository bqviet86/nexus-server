import { ObjectId } from 'mongodb'

type RefreshTokenConstructor = {
    _id?: ObjectId
    token: string
    user_id: ObjectId
    iat: number
    exp: number
    created_at?: Date
}

export default class RefreshToken {
    _id?: ObjectId
    token: string
    user_id: ObjectId
    iat: Date
    exp: Date
    created_at: Date

    constructor(refreshToken: RefreshTokenConstructor) {
        this._id = refreshToken._id
        this.token = refreshToken.token
        this.user_id = refreshToken.user_id
        this.iat = new Date(refreshToken.iat * 1000) // Convert Epoch time to Date
        this.exp = new Date(refreshToken.exp * 1000) // Convert Epoch time to Date
        this.created_at = refreshToken.created_at || new Date()
    }
}
