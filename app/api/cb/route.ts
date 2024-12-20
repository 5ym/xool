import type { User } from "@/utils/Model";
import { client, getMe } from "@/utils/client";
import mongo from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const errorRes = NextResponse.redirect(`https://${process.env.HOST}`);
	const code = searchParams.get("code");
	const redirect = searchParams.get("redirect") ?? "";
	if (process.env.HASH !== searchParams.get("state") || !code) {
		errorRes.cookies.set("message", "不正なリクエストです");
		return errorRes;
	}
	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code: code,
		code_verifier: "challenge",
		redirect_uri: `https://${process.env.HOST}/api/cb?redirect=${redirect}`,
	});
	const data = await client("POST", "oauth2/token", params.toString());
	if (data.error === "invalid_request") {
		return NextResponse.redirect(
			`https://${process.env.HOST}/api/oauth?=${redirect}`,
		);
	}

	const user = await getMe(data.access_token);
	if (user.status === 429) {
		errorRes.cookies.set(
			"message",
			"API利用上限に達しましたしばらく経ってから再試行してください",
		);
		return errorRes;
	}
	const collection = (await mongo()).collection<User>("user");
	const existUser = await collection.findOne({ socialId: user.data.id });
	const successRes = NextResponse.redirect(
		`https://${process.env.HOST}/${redirect}`,
	);
	if (existUser !== null) {
		await collection.updateOne(
			{ socialId: user.data.id },
			{
				$set: {
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
				},
			},
		);
		successRes.cookies.set("key", existUser.key, { maxAge: 1209600 });
		return successRes;
	}
	const key = await generateKey();
	collection.insertOne({
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		key: key,
		socialId: user.data.id,
	});
	successRes.cookies.set("key", key, { maxAge: 1209600 });

	return successRes;
}

async function generateKey() {
	const key = crypto.randomUUID();
	const collection = (await mongo()).collection<User>("user");
	const existUser = await collection.findOne({ key: key });
	if (existUser !== null) return await generateKey();
	return key;
}
