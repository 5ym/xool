import { Condition, ObjectId } from "mongodb";

export default interface User {
    _id?: Condition<ObjectId>,
    accessToken: string,
    refreshToken: string,
    key: string,
    socialId: string,
}