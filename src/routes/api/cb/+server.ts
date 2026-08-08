import { redirect } from "@sveltejs/kit";
import { action, client } from "$lib/server/client";
import db from "$lib/server/db";
import { generateUniqueKey } from "$lib/server/key";
import type { User } from "$lib/server/model";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const redirectParam = url.searchParams.get("redirect") ?? "";
	if (process.env.HASH !== url.searchParams.get("state") || !code) {
		cookies.set("message", "不正なリクエストです", { path: "/" });
		redirect(302, "/");
	}
	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		code_verifier: "challenge",
		redirect_uri: `${url.origin}/api/cb?redirect=${redirectParam}`,
	});
	const data = await client("POST", "oauth2/token", params.toString());
	if (data.error === "invalid_request") {
		redirect(302, `/api/oauth?redirect=${redirectParam}`);
	}

	const user = await action("me", data.access_token);
	if (user.status === 429) {
		cookies.set(
			"message",
			"API利用上限に達しましたしばらく経ってから再試行してください",
			{ path: "/" },
		);
		redirect(302, "/");
	}
	const existUser = db()
		.query<User, [string]>("SELECT * FROM user WHERE socialId = ?")
		.get(user.data.id);
	if (existUser !== null) {
		db().run(
			"UPDATE user SET accessToken = ?, refreshToken = ? WHERE socialId = ?",
			[data.access_token, data.refresh_token, user.data.id],
		);
		cookies.set("key", existUser.key, { path: "/", maxAge: 1209600 });
		redirect(302, `/${redirectParam}`);
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
	cookies.set("key", key, { path: "/", maxAge: 1209600 });
	redirect(302, `/${redirectParam}`);
};
