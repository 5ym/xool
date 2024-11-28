"use client";

import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useState,
} from "react";

export const Context = createContext<{
	message?: string;
	setMessage: Dispatch<SetStateAction<string | undefined>>;
}>({
	setMessage: () => {},
});
export default function GlobalContext({ children }: { children: ReactNode }) {
	const [message, setMessage] = useState<string>();

	return (
		<Context.Provider value={{ message, setMessage }}>
			{children}
		</Context.Provider>
	);
}
