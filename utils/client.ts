import mongo from "./db"

export async function client(method: string, url: string, body: string|null, bearer: string = '') {
    let headers: Record<string, string>
    if (bearer === '') {
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET).toString('base64'),
        }
        
    } else {
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
        }
    }

    return await (await fetch(`https://api.twitter.com/2/${url}`, {
        method: method,
        headers: headers,
        body: body,
        cache: 'no-store',
    })).json()
}

export async function getMe(bearer: string) {
    return await client('GET', 'users/me', null, bearer)
}

export async function postTweet(bearer: string, text: string) {
    return await client('POST', 'tweets', JSON.stringify({text: text}), bearer)
}

export async function refreshToken(refreshToken: string) {
    const params = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    });
    return await client('POST', 'oauth2/token', params.toString())
}

export async function autoAction(type: string, key: string, text: string = '') {
    const collection = (await mongo()).collection('user')
    const existUser = await collection.findOne({key: key})
    if (existUser === null)
        return {error: 'keyが無効です再ログインしてください'}
    let accessToken = existUser.accessToken
    let ret
    switch(type) {
        case 'me':
            ret = await getMe(accessToken)
            break;
        case 'tweet':
            ret = await postTweet(accessToken, text)
    }
    if (ret.status !== 401)
        return ret
    const refreshedToken = await refreshToken(existUser.refreshToken)
    if (refreshedToken.error === 'invalid_request')
        return {error: '再認証してください'}
    accessToken = refreshedToken.access_token
    await collection.updateOne(
        {_id: existUser._id},
        {$set: {
            accessToken: accessToken,
            refreshToken: refreshedToken.refresh_token
        }}
    )
    switch(type) {
        case 'me':
            ret = await getMe(accessToken)
            break;
        case 'tweet':
            ret = await postTweet(accessToken, text)
    }
    return ret
}