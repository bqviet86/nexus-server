import { ObjectId } from 'mongodb'

interface ProvinceConstructor {
    _id?: ObjectId
    province_id: string
    province_name: string
    province_type: string
}

export default class Province {
    _id?: ObjectId
    province_id: string
    province_name: string
    province_type: string

    constructor(province: ProvinceConstructor) {
        this._id = province._id
        this.province_id = province.province_id
        this.province_name = province.province_name
        this.province_type = province.province_type
    }
}
