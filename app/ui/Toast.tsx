"use client";

import { useContext, useRef } from "react";
import { Context } from "./GlobalContext";

export default function Toast() {
	const { message, setMessage } = useContext(Context);
	const ref = useRef<HTMLDivElement>(null);
	if (!message || !setMessage) {
		return;
	}
	ref.current?.togglePopover();
	setTimeout(() => {
		setMessage("");
	}, 2000);

	return (
		<div ref={ref} className="toast bg-transparent" popover="auto">
			<div className="alert alert-info">
				<span>{message}</span>
			</div>
		</div>
	);
}
