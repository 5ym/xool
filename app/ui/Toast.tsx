"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "./GlobalContext";

export default function Toast() {
	const { message, setMessage } = useContext(Context);
	const [messageList, setMessageList] = useState<
		{ id: number; text: string }[]
	>([]);
	const [isShow, setIsShow] = useState(true);
	const showTimeout = useRef<Timer>(null);
	const messageTimeout = useRef<Timer>(null);
	const nextId = useRef(0);

	useEffect(() => {
		if (message) {
			setIsShow(true);
			nextId.current += 1;
			setMessageList([{ id: nextId.current, text: message }, ...messageList]);
			setMessage("");
			if (showTimeout.current) clearTimeout(showTimeout.current);
			if (messageTimeout.current) clearTimeout(messageTimeout.current);
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
			{messageList.map((mes) => (
				<div key={mes.id} className="alert alert-info">
					<span>{mes.text}</span>
				</div>
			))}
		</div>
	);
}
