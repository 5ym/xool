import { autoAction } from "$lib/server/client";
import { getSummary } from "$lib/server/summary";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const message = cookies.get("message");

	if (message !== undefined || wkey === undefined) {
		return { message, wkey };
	}

	const summary = getSummary(wkey);

	return {
		message,
		wkey,
		summary: {
			enabled: summary?.enabled === 1,
			lastSummarizedOn: summary?.lastSummarizedOn ?? undefined,
			lastError: summary?.lastError ?? undefined,
		},
		keyInfo: autoAction("me", wkey),
	};
};
