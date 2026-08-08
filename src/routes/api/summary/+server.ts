import { json } from "@sveltejs/kit";
import { getSummary, postDueSummaries, setEnabled } from "$lib/server/summary";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userKey = cookies.get("key");
	if (!userKey) {
		return json({ error: "ログインしてください" }, { status: 401 });
	}
	const { enabled } = await request.json();
	if (typeof enabled !== "boolean") {
		return json({ error: "enabledを指定してください" }, { status: 400 });
	}

	setEnabled(userKey, enabled);
	// Post the first one now rather than at the next midnight, so switching this
	// on shows you what it does.
	const posted = enabled ? await postDueSummaries(userKey) : 0;

	const summary = getSummary(userKey);
	return json({
		enabled: summary?.enabled === 1,
		posted: posted > 0,
		error: summary?.lastError ?? undefined,
	});
};
