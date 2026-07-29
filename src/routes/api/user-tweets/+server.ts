import { json } from "@sveltejs/kit";
import { autoAction } from "$lib/server/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get("key");
	const id = url.searchParams.get("id");
	if (!key || !id) {
		return json({ message: "key, idを指定してください" }, { status: 400 });
	}
	return json(await autoAction("userTweets", key, { id }));
};
