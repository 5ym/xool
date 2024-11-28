"use client";

import { useContext, useRef } from "react";
import { Context } from "./GlobalContext";

export default function Toast() {
	const { message, setMessage } = useContext(Context)
	if (!message || !setMessage) {
		return;
	}
	setTimeout(() => {
		setMessage("");
	}, 2000);

	return (
		<div className="toast bg-transparent" popover="auto">
			<div className="alert alert-info">
				<span>{message}</span>
			</div>
		</div>
	);
}
