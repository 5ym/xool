import { json } from "@sveltejs/kit";
import { autoAction } from "$lib/server/client";
import type { RequestHandler } from "./$types";

// The key rides in the path so the whole endpoint can be pasted into any
// service that only lets you configure a webhook URL and a JSON body.
export const POST: RequestHandler = async ({ params, request }) => {
	const { text } = await request.json();
	const result = await autoAction("tweet", params.key, { text });
	// Answer with the status x.com gave us so a caller can tell a rejected post
	// from an accepted one without inspecting the body.
	const status = result?.rateLimit?.httpStatus;
	return json(result, { status: status && status >= 400 ? status : 200 });
};
