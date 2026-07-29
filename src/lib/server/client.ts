import db from "./db";
import type { User } from "./model";

export async function client(
	method: string,
	url: string,
	body: string | null,
	bearer = "",
) {
	const headers =
		bearer === ""
			? {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${Buffer.from(
						`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
					).toString("base64")}`,
				}
			: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${bearer}`,
				};

	return await (
		await fetch(`https://api.x.com/2/${url}`, {
			method,
			headers,
			body,
			cache: "no-store",
		})
	).json();
}

export async function refreshToken(refreshToken: string) {
	const params = new URLSearchParams({
		refresh_token: refreshToken,
		grant_type: "refresh_token",
	});
	return await client("POST", "oauth2/token", params.toString());
}

export async function autoAction(
	type: string,
	key: string,
	payload?: { text?: string; media?: string; id?: string },
) {
	const existUser = db()
		.query<User, [string]>("SELECT * FROM user WHERE key = ?")
		.get(key);
	if (existUser === null)
		return { error: "keyが無効です再ログインしてください" };
	let accessToken = existUser.accessToken;
	const ret = await action(type, accessToken, payload);
	if (ret?.status !== 401) return ret;
	const refreshedToken = await refreshToken(existUser.refreshToken);
	if (refreshedToken.error === "invalid_request")
		return { error: "再認証してください" };
	accessToken = refreshedToken.access_token;
	db().run("UPDATE user SET accessToken = ?, refreshToken = ? WHERE key = ?", [
		accessToken,
		refreshedToken.refresh_token,
		key,
	]);
	return await action(type, accessToken, payload);
}

type ReturnType<T, U = undefined> = {
	status?: number;
	error?: string;
	data: T;
	meta: U;
};

export async function action(
	type: string,
	accessToken: string,
	payload?: { text?: string; media?: string; id?: string; sinceId?: string },
) {
	switch (type) {
		case "me":
			return (await client(
				"GET",
				"users/me",
				null,
				accessToken,
			)) as ReturnType<{
				id: number;
				name: string;
				username: string;
			}>;
		case "tweet":
			return await client(
				"POST",
				"tweets",
				JSON.stringify({ text: payload?.text }),
				accessToken,
			);
		case "userTweets": {
			const searchParams = new URLSearchParams({
				max_results: "100",
			});
			if (payload?.sinceId) {
				searchParams.append("since_id", payload.sinceId);
			}
			return (await client(
				"GET",
				`users/${payload?.id}/tweets?${searchParams.toString()}`,
				null,
				accessToken,
			)) as ReturnType<
				{
					id: string;
					text: string;
				}[],
				{
					newest_id: string;
					oldest_id: string;
				}
			>;
		}
	}

	return {
		status: 400,
		error: "存在しないアクションです",
	};
}
