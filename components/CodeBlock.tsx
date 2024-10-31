import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { type BundledLanguage, codeToHast } from "shiki";

export default async function CodeBlock({
	code,
	lang,
	className = "",
}: {
	code: string;
	lang: BundledLanguage;
	className?: string;
}) {
	const out = await codeToHast(code, { lang, theme: "one-dark-pro" });
	return toJsxRuntime(out, {
		Fragment,
		jsx,
		jsxs,
		components: {
			pre: (props) => (
				<pre
					{...props}
					className={`${props.className} px-4 py-3 overflow-auto rounded-2xl ${className}`}
				/>
			),
		},
	});
}
