import { NextResponse } from "next/server";
import { action, client } from "@/utils/client";
import mongo from "@/utils/db";
import { HOST_URL } from "@/utils/env";
import { generateUniqueKey } from "@/utils/key";
import type { User } from "@/utils/Model";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const errorRes = NextResponse.redirect(HOST_URL);
	const code = searchParams.get("code");
	const redirect = searchParams.get("redirect") ?? "";
	if (process.env.HASH !== searchParams.get("state") || !code) {
		errorRes.cookies.set("message", "不正なリクエストです");
		return errorRes;
	}
	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		code_verifier: "challenge",
		redirect_uri: `${HOST_URL}/api/cb?redirect=${redirect}`,
	});
	const data = await client("POST", "oauth2/token", params.toString());
	if (data.error === "invalid_request") {
		return NextResponse.redirect(`${HOST_URL}/api/oauth?=${redirect}`);
	}

	const user = await action("me", data.access_token);
	if (user.status === 429) {
		errorRes.cookies.set(
			"message",
			"API利用上限に達しましたしばらく経ってから再試行してください",
		);
		return errorRes;
	}
	const collection = (await mongo()).collection<User>("user");
	const existUser = await collection.findOne({ socialId: user.data.id });
	const successRes = NextResponse.redirect(`${HOST_URL}/${redirect}`);
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
	const key = await generateUniqueKey(
		async (k) => (await collection.findOne({ key: k })) !== null,
	);
	collection.insertOne({
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		key,
		socialId: user.data.id,
	});
	successRes.cookies.set("key", key, { maxAge: 1209600 });

	return successRes;
}
