"use client";

import { useRef, useState } from "react";
import CopyButton from "./CopyButton";

export default function Gallery({ fileNameList }: { fileNameList: string[] }) {
	const [diaImage, setDiaImage] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);
	const onClickItem = (fileName: string) => {
		setDiaImage(fileName);
		dialog.current?.showModal();
	};
	const closeDialog = () => {
		dialog.current?.close();
	};
	return (
		<>
			<div className="flex flex-wrap gap-3 overflow-x-hidden overflo-y-visible py-3">
				{fileNameList.map((fileName) => (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						key={fileName}
						className="relative grow h-64 max-w-lg cursor-pointer rounded-3xl overflow-hidden bg-primary-content hover:scale-105 transition-all"
						onClick={() => onClickItem(fileName)}
					>
						<CopyButton fileName={fileName} />
						<img
							src={`/images/${fileName}`}
							alt="LGTM"
							className="h-full w-full object-cover"
						/>
					</div>
				))}
			</div>
			<dialog ref={dialog} className="modal">
				<div className="modal-box w-auto">
					<div className="relative group/item">
						<img src={`/images/${diaImage}`} alt="LGTM" />
						<CopyButton
							fileName={diaImage}
							onClick={closeDialog}
							className="invisible group-hover/item:visible"
						/>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button type="button" onClick={closeDialog}>
						close
					</button>
				</form>
			</dialog>
		</>
	);
}
