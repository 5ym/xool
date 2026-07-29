import { codeToHtml } from "shiki";
import { autoAction } from "$lib/server/client";
import { HOST_URL } from "$lib/server/env";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const message = cookies.get("message");

	if (message !== undefined || wkey === undefined) {
		return { message, wkey };
	}

	const curlHtml = await codeToHtml(
		`curl \\\n\t--location '${HOST_URL}/api/tweets' \\\n\t--header 'Content-Type: application/json' \\\n\t--data '{"key": "${wkey}","text": "example"}'`,
		{
			lang: "sh",
			theme: "one-dark-pro",
			transformers: [
				{
					pre(node) {
						this.addClassToHast(node, "px-4 py-3 overflow-auto rounded-lg");
					},
				},
			],
		},
	);

	return {
		message,
		wkey,
		curlHtml,
		keyInfo: autoAction("me", wkey),
	};
};
