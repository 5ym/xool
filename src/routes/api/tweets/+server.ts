import { json } from "@sveltejs/kit";
import { autoAction } from "$lib/server/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const { key, text, media } = await request.json();
	const result = await autoAction("tweet", key, { text, media });
	// Answer with the status x.com gave us so a caller can tell a rejected post
	// from an accepted one without inspecting the body.
	const status = result?.rateLimit?.httpStatus;
	return json(result, { status: status && status >= 400 ? status : 200 });
};
