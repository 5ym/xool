import { redirect } from "@sveltejs/kit";
import { HOST_URL } from "$lib/server/env";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const redirectUrl = encodeURI(
		`${HOST_URL}/api/cb?redirect=${url.searchParams.get("redirect") ?? ""}`,
	);
	cookies.delete("message", { path: "/" });
	redirect(
		302,
		`https://x.com/i/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUrl}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${process.env.HASH}&code_challenge=challenge&code_challenge_method=plain`,
	);
};
