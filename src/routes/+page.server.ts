import { autoAction } from "$lib/server/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const message = cookies.get("message");

	if (message !== undefined || wkey === undefined) {
		return { message, wkey };
	}

	return {
		message,
		wkey,
		keyInfo: autoAction("me", wkey),
	};
};
