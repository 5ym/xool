import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
    const res = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=https://${process.env.HOST}/api/cb&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${process.env.HASH}&code_challenge=challenge&code_challenge_method=plain`)
    res.cookies.delete('message')
    return res
}