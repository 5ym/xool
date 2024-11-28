"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { create } from "../lgtm/actions";
import { Context } from "./GlobalContext";

export default function Upload({ userKey }: { userKey: string }) {
	const [isGenerating, setIsGenerating] = useState(false);
	const { setMessage } = useContext(Context);
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const onDrop = async (ev: DragEvent) => {
			ev.preventDefault();
			if (!isGenerating && ev.dataTransfer?.files && inputRef.current) {
				inputRef.current.files = ev.dataTransfer.files;
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
	}, [isGenerating]);

	useEffect(() => {
		const onSelectImage = async () => {
			if (!inputRef.current) {
				return;
			}
			try {
				setIsGenerating(true);
				await create(inputRef.current.files, userKey);
			} finally {
				setMessage("画像生成完了");
				router.refresh();
				inputRef.current.value = "";
				setIsGenerating(false);
			}
		};
		inputRef.current?.addEventListener("change", onSelectImage);
		return () => {
			inputRef.current?.removeEventListener("change", onSelectImage);
		};
	}, [router, setMessage, userKey]);

	return (
		<>
			<div>
				<input
					ref={inputRef}
					accept="image/*"
					type="file"
					className="file-input w-full max-w-xs"
					disabled={isGenerating}
					multiple
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
