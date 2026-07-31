import bash from "@shikijs/langs/bash";
import oneDarkPro from "@shikijs/themes/one-dark-pro";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { autoAction } from "$lib/server/client";
import { HOST_URL } from "$lib/server/env";
import type { PageServerLoad } from "./$types";

// Importing shiki's default entry pulls every language and theme it ships --
// around 12MB that then has to live in the runtime image for the sake of one
// shell snippet. Name the two pieces this page actually uses instead, so the
// build can bundle them and shiki drops out of the runtime dependencies
// entirely. The JavaScript engine keeps it to plain JS, with no wasm to carry.
// Built once at module scope: the grammar only needs parsing the first time.
const highlighter = createHighlighterCore({
	langs: [bash],
	themes: [oneDarkPro],
	engine: createJavaScriptRegexEngine(),
});

export const load: PageServerLoad = async ({ cookies }) => {
	const wkey = cookies.get("key");
	const message = cookies.get("message");

	if (message !== undefined || wkey === undefined) {
		return { message, wkey };
	}

	const curlHtml = (await highlighter).codeToHtml(
		`curl \\\n\t--location '${HOST_URL}/api/tweets' \\\n\t--header 'Content-Type: application/json' \\\n\t--data '{"key": "${wkey}","text": "example"}'`,
		{
			lang: "bash",
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
