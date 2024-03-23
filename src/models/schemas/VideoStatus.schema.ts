import { ObjectId } from 'mongodb'

import { VideoEncodingStatus } from '~/constants/enums'

interface VideoStatusConstructor {
    _id?: ObjectId
    name: string
    status: VideoEncodingStatus
    created_at?: Date
    updated_at?: Date
}

export default class VideoStatus {
    _id?: ObjectId
    name: string
    status: VideoEncodingStatus
    created_at: Date
    updated_at: Date

    constructor(videoStatus: VideoStatusConstructor) {
        const date = new Date()

        this._id = videoStatus._id
        this.name = videoStatus.name
        this.status = videoStatus.status
        this.created_at = videoStatus.created_at || date
        this.updated_at = videoStatus.updated_at || date
    }
}
