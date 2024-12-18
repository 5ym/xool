import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const redirectUrl = encodeURI(
		`https://${process.env.HOST}/api/cb?redirect=${searchParams.get("redirect") ?? ""}`,
	);
	const res = NextResponse.redirect(
		`https://x.com/i/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${process.env.HASH}&code_challenge=challenge&code_challenge_method=plain`,
	);
	res.cookies.delete("message");
	return res;
}
