import db from "$lib/server/db";
import { captureIfStale, history, lastCapturedAt } from "$lib/server/metrics";
import type { User } from "$lib/server/model";
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
	let captureFailed = false;
	try {
		await captureIfStale(wkey);
	} catch {
		captureFailed = true;
	}

	return {
		isLoggedIn: true,
		wkey,
		captureFailed,
		capturedAt: lastCapturedAt(wkey),
		tweets: history(wkey),
	};
};
