import { json } from "@sveltejs/kit";
import { autoAction } from "$lib/server/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const { key, text, media } = await request.json();
	return json(await autoAction("tweet", key, { text, media }));
};
