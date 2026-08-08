import { json } from "@sveltejs/kit";
import { getSummary, setEnabled } from "$lib/server/summary";
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
	return json({ enabled: getSummary(userKey)?.enabled === 1 });
};
