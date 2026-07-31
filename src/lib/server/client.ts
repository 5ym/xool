import db from "./db";
import type { User } from "./model";

export type RateLimit = {
	httpStatus: number;
	limit?: number;
	remaining?: number;
	reset?: number;
	daily?: {
		limit?: number;
		remaining?: number;
		reset?: number;
	};
	retryAfter?: number;
};

function headerNumber(res: Response, name: string) {
	const value = res.headers.get(name);
	if (value === null) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function rateLimitOf(res: Response): RateLimit {
	return {
		httpStatus: res.status,
		limit: headerNumber(res, "x-rate-limit-limit"),
		remaining: headerNumber(res, "x-rate-limit-remaining"),
		reset: headerNumber(res, "x-rate-limit-reset"),
		daily: {
			limit: headerNumber(res, "x-user-limit-24hour-limit"),
			remaining: headerNumber(res, "x-user-limit-24hour-remaining"),
			reset: headerNumber(res, "x-user-limit-24hour-reset"),
		},
		retryAfter: headerNumber(res, "retry-after"),
	};
}

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

	const res = await fetch(`https://api.x.com/2/${url}`, {
		method,
		headers,
		body,
		cache: "no-store",
	});

	// Callers need the throttling window to decide when a rejected request may
	// be retried, and x.com only reports it in the response headers.
	return { ...(await res.json()), rateLimit: rateLimitOf(res) };
}

export async function refreshToken(refreshToken: string) {
	const params = new URLSearchParams({
		refresh_token: refreshToken,
		grant_type: "refresh_token",
	});
	return await client("POST", "oauth2/token", params.toString());
}

export type ActionPayload = {
	text?: string;
	media?: string;
	id?: string;
	sinceId?: string;
	startTime?: string;
};

export async function autoAction(
	type: string,
	key: string,
	payload?: ActionPayload,
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
	rateLimit?: RateLimit;
};

export type XPostMetrics = {
	id: string;
	text: string;
	created_at: string;
	public_metrics?: {
		impression_count?: number;
		like_count?: number;
		retweet_count?: number;
		reply_count?: number;
		quote_count?: number;
		bookmark_count?: number;
	};
	non_public_metrics?: {
		impression_count?: number;
		user_profile_clicks?: number;
		url_link_clicks?: number;
	};
	organic_metrics?: {
		impression_count?: number;
		user_profile_clicks?: number;
		url_link_clicks?: number;
		like_count?: number;
		retweet_count?: number;
		reply_count?: number;
	};
};

export async function action(
	type: string,
	accessToken: string,
	payload?: ActionPayload,
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
		case "tweetMetrics": {
			const searchParams = new URLSearchParams({
				max_results: "100",
				"tweet.fields":
					"created_at,public_metrics,non_public_metrics,organic_metrics",
			});
			// x.com refuses the whole request when the range reaches back past the
			// 30 day window it keeps non-public and organic metrics for, so the
			// caller has to bound it.
			if (payload?.startTime) {
				searchParams.append("start_time", payload.startTime);
			}
			return (await client(
				"GET",
				`users/${payload?.id}/tweets?${searchParams.toString()}`,
				null,
				accessToken,
			)) as ReturnType<
				XPostMetrics[],
				{
					newest_id: string;
					oldest_id: string;
					result_count: number;
				}
			>;
		}
	}

	return {
		status: 400,
		error: "存在しないアクションです",
	};
}
