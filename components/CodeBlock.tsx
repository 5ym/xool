import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { type BundledLanguage, codeToHast, codeToHtml } from "shiki";

export default async function CodeBlock({
	code,
	lang,
}: {
	code: string;
	lang: BundledLanguage;
}) {
	const out = await codeToHast(code, { lang, theme: "vitesse-dark" });
	return toJsxRuntime(out, {
		Fragment,
		jsx,
		jsxs,
		components: {
			pre: (props) => (
				<pre {...props} className={`${props.className} p-2 overflow-auto`} />
			),
		},
	});
}
