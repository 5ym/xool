import db from "$lib/server/db";
import { captureIfStale, history, lastCapturedAt } from "$lib/server/metrics";
import type { User } from "$lib/server/model";
import { xStatusMessage } from "$lib/xStatus";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const existUser = wkey
		? db().query<User, [string]>("SELECT * FROM user WHERE key = ?").get(wkey)
		: null;

	if (wkey === undefined || existUser === null) {
		return { isLoggedIn: false, tweets: [] };
	}

	// A failed snapshot still leaves everything recorded so far worth showing.
	// x.com's refusals come back in the result rather than as a throw, so
	// watching only for exceptions here read a rejected snapshot as a fine one.
	let captureError: string | undefined;
	try {
		const ret = await captureIfStale(wkey);
		if (ret && "error" in ret) {
			captureError = ret.error;
		} else if (ret?.rateLimit && ret.rateLimit.httpStatus >= 400) {
			captureError = xStatusMessage(ret.rateLimit.httpStatus);
		}
	} catch (error) {
		captureError =
			error instanceof Error ? error.message : "数値の取得に失敗しました";
	}

	return {
		isLoggedIn: true,
		wkey,
		captureError,
		capturedAt: lastCapturedAt(wkey),
		tweets: history(wkey),
	};
};
