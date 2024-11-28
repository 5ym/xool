import { type MouseEvent, useCallback, useContext, useState } from "react";
import { Context } from "./GlobalContext";

export default function CopyButton({
	fileName,
	className,
	onClick,
}: { fileName: string; className?: string; onClick?: () => void }) {
	const { setMessage } = useContext(Context);
	const onClickCopy = useCallback(
		(e: MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			navigator.clipboard.writeText(
				`![LGTM](${window.location.origin}/images/${fileName})`,
			);
			setMessage("リンクをコピーしました");
			if (onClick) {
				onClick();
			}
		},
		[fileName, setMessage, onClick],
	);

	return (
		<button
			type="button"
			className={`btn btn-square absolute right-3 top-3 ${className}`}
			onClick={onClickCopy}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<title>Copy</title>
				<path
					strokeWidth="2"
					d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
				/>
			</svg>
		</button>
	);
}
