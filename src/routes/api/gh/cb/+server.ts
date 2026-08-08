import { redirect } from "@sveltejs/kit";
import db from "$lib/server/db";
import { accessToken, githubUser } from "$lib/server/github";
import { generateUniqueKey } from "$lib/server/key";
import type { GhUser } from "$lib/server/model";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	if (process.env.HASH !== url.searchParams.get("state") || !code) {
		cookies.set("message", "不正なリクエストです", { path: "/" });
		redirect(302, "/");
	}

	const token = await accessToken(code, `${url.origin}/api/gh/cb`);
	const user = token === undefined ? undefined : await githubUser(token);
	if (user === undefined) {
		cookies.set("message", "GitHubの認証に失敗しました", { path: "/" });
		redirect(302, "/");
	}

	const existing = db()
		.query<GhUser, [string]>("SELECT * FROM ghUser WHERE githubId = ?")
		.get(user.id);
	if (existing !== null) {
		db().run("UPDATE ghUser SET login = ? WHERE githubId = ?", [
			user.login,
			user.id,
		]);
		cookies.set("key", existing.key, { path: "/", maxAge: 1209600 });
		redirect(302, "/");
	}

	const key = await generateUniqueKey(
		async (k) =>
			db()
				.query<GhUser, [string]>("SELECT * FROM ghUser WHERE key = ?")
				.get(k) !== null,
	);
	db().run("INSERT INTO ghUser (key, githubId, login) VALUES (?, ?, ?)", [
		key,
		user.id,
		user.login,
	]);
	cookies.set("key", key, { path: "/", maxAge: 1209600 });
	redirect(302, "/");
};
