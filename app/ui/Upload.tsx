"use client";

import { useRouter } from "next/navigation";
import {
	type ChangeEvent,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { create } from "../lgtm/actions";
import { Context } from "./GlobalContext";

export default function Upload({ userKey }: { userKey: string }) {
	const [isGenerating, setIsGenerating] = useState(false);
	const { setMessage } = useContext(Context);
	const router = useRouter();
	const onSelectImage = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			try {
				setIsGenerating(true);
				await create(e.target.files, userKey);
			} finally {
				if (setMessage) {
					setMessage("画像生成完了");
				}
				router.refresh();
				e.target.value = "";
				setIsGenerating(false);
			}
		},
		[router, userKey, setMessage],
	);

	useEffect(() => {
		const onDrop = async (ev: DragEvent) => {
			ev.preventDefault();
			if (ev.dataTransfer?.files) {
				setIsGenerating(true);
				await create(ev.dataTransfer?.files, userKey);
				if (setMessage) {
					setMessage("画像生成完了");
				}
				router.refresh();
				setIsGenerating(false);
			}
		};
		const onDragOver = (ev: DragEvent) => {
			ev.preventDefault();
		};
		document.addEventListener("drop", onDrop);
		document.addEventListener("dragover", onDragOver);
		return () => {
			document.removeEventListener("drop", onDrop);
			document.removeEventListener("dragover", onDragOver);
		};
	}, [router, userKey, setMessage]);

	return (
		<>
			<div>
				<input
					accept="image/*"
					onChange={onSelectImage}
					type="file"
					className="file-input w-full max-w-xs"
					disabled={isGenerating}
				/>
				{isGenerating && (
					<>
						<progress className="progress w-52 ml-4" />
						<span className="ml-4">画像生成中</span>
					</>
				)}
			</div>
		</>
	);
}
