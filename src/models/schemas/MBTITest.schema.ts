import { ObjectId } from 'mongodb'

import { MBTITestStatus, MBTIType } from '~/constants/enums'
import { MBTIAnswer } from '../Types'

interface MBTITestConstructor {
    _id?: ObjectId
    dating_user_id: ObjectId
    answers: MBTIAnswer[]
    mbti_type?: MBTIType
    status?: MBTITestStatus
    created_at?: Date
    updated_at?: Date
}

export default class MBTITest {
    _id?: ObjectId
    dating_user_id: ObjectId
    answers: MBTIAnswer[]
    mbti_type: MBTIType | ''
    status: MBTITestStatus
    created_at: Date
    updated_at: Date

    constructor(mbtiTest: MBTITestConstructor) {
        const date = new Date()

        this._id = mbtiTest._id
        this.dating_user_id = mbtiTest.dating_user_id
        this.answers = mbtiTest.answers
        this.mbti_type = mbtiTest.mbti_type || ''
        this.status = mbtiTest.status || MBTITestStatus.Pending
        this.created_at = mbtiTest.created_at || date
        this.updated_at = mbtiTest.updated_at || date
    }
}
