import { json } from "@sveltejs/kit";
import { capture } from "$lib/server/metrics";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const { key } = await request.json();
	if (!key) {
		return json({ message: "keyを指定してください" }, { status: 400 });
	}
	const result = await capture(key);
	// Answer with the status x.com gave us so a scheduler can tell a throttled
	// snapshot from a recorded one without inspecting the body.
	const status = result?.rateLimit?.httpStatus;
	return json(result, { status: status && status >= 400 ? status : 200 });
};
