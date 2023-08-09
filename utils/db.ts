import { MongoClient } from 'mongodb'

export default async function mongo() {
    const client = new MongoClient('mongodb://root:toor@db:27017', {})
    const connect = await client.connect()
    return connect.db('tweel')
}