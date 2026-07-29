import { NextResponse } from "next/server";
import { action, client } from "@/utils/client";
import db from "@/utils/db";
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
	const existUser = db()
		.query<User, [string]>("SELECT * FROM user WHERE socialId = ?")
		.get(user.data.id);
	const successRes = NextResponse.redirect(`${HOST_URL}/${redirect}`);
	if (existUser !== null) {
		db().run(
			"UPDATE user SET accessToken = ?, refreshToken = ? WHERE socialId = ?",
			[data.access_token, data.refresh_token, user.data.id],
		);
		successRes.cookies.set("key", existUser.key, { maxAge: 1209600 });
		return successRes;
	}
	const key = await generateUniqueKey(
		async (k) =>
			db().query<User, [string]>("SELECT * FROM user WHERE key = ?").get(k) !==
			null,
	);
	db().run(
		"INSERT INTO user (key, socialId, accessToken, refreshToken) VALUES (?, ?, ?, ?)",
		[key, user.data.id, data.access_token, data.refresh_token],
	);
	successRes.cookies.set("key", key, { maxAge: 1209600 });

	return successRes;
}
