import { client, getMe } from '@/utils/client'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import mongo from '@/utils/db'
 
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const res = NextResponse.redirect(`https://${process.env.HOST}`)
    const code = searchParams.get('code')
    if (process.env.HASH !== searchParams.get('state') || !code)
        return res
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        code_verifier: "challenge",
        redirect_uri: `https://${process.env.HOST}/api/cb`
    });
    const data = await client('POST', 'oauth2/token', params.toString())
    if (data.error === 'invalid_request')
        redirect('/api/oauth')

    const user = await getMe(data.access_token)
    if (user.status === 429) {
        res.cookies.set('message', 'API利用上限に達しましたしばらく経ってから再試行してください')
        return res
    }
    const collection = (await mongo()).collection('user')
    const existUser = await collection.findOne({socialId: user.data.id})
    if (existUser !== null) {
        await collection.updateOne(
            {socialId: user.data.id},
            {$set: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
            }}
        )
        res.cookies.set('key', existUser.key, {maxAge: 1209600})
        return res
    }
    const key = await generateKey()
    collection.insertOne({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        key: key,
        socialId: user.data.id,
    })
    res.cookies.set('key', key, {maxAge: 1209600})

    return res
}

async function generateKey() {
    const key = crypto.randomUUID()
    const collection = (await mongo()).collection('user')
    const existUser = await collection.findOne({'key': key})
    if (existUser !== null)
        generateKey()
    return key
}