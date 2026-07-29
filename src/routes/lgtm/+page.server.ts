import db from "$lib/server/db";
import { get } from "$lib/server/lgtm";
import type { User } from "$lib/server/model";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const existUser = wkey
		? db().query<User, [string]>("SELECT * FROM user WHERE key = ?").get(wkey)
		: null;

	return {
		wkey,
		isLoggedIn: existUser !== null,
		recentImages: get(1, false, wkey),
		myImages: wkey ? get(1, true, wkey) : [],
	};
};
