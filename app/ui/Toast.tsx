"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "./GlobalContext";

export default function Toast() {
	const { message, setMessage } = useContext(Context);
	const [messageList, setMessageList] = useState<string[]>([]);
	const [isShow, setIsShow] = useState(true);
	const showTimeout = useRef<Timer>();
	const messageTimeout = useRef<Timer>();

	useEffect(() => {
		if (message && setMessage) {
			setIsShow(true);
			setMessageList([message, ...messageList]);
			setMessage("");
			clearTimeout(showTimeout.current);
			clearTimeout(messageTimeout.current);
			showTimeout.current = setTimeout(() => {
				setIsShow(false);
			}, 1500);
			messageTimeout.current = setTimeout(() => {
				setMessageList([]);
			}, 2000);
		}
	}, [message, messageList, setMessage]);

	return (
		<div className={`toast transition-all ${isShow ? "" : "opacity-0"}`}>
			{messageList.map((mes, i) => (
				<div key={i + mes} className="alert alert-info">
					<span>{mes}</span>
				</div>
			))}
		</div>
	);
}
