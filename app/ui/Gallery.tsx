"use client";

import type { LImage } from "@/utils/Model";
import type { WithId } from "mongodb";
import { useRef, useState } from "react";
import CopyButton from "./CopyButton";

export default function Gallery({
	imageList,
}: { imageList: WithId<LImage>[] }) {
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
			<div className="flex flex-wrap gap-3">
				{imageList.map((image) => (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						key={image.fileName}
						className="relative group/item grow h-[250px] max-w-[500px] cursor-pointer rounded-3xl overflow-hidden bg-primary-content"
						onClick={() => onClickItem(image.fileName)}
					>
						<CopyButton fileName={image.fileName} />
						<img
							src={`/images/${image.fileName}`}
							alt="LGTM"
							className="h-full w-full object-cover group-hover/item:object-contain mx-auto"
						/>
					</div>
				))}
			</div>
			<dialog ref={dialog} id="my_modal_1" className="modal">
				<div className="modal-box">
					<img src={`/images/${diaImage}`} alt="LGTM" className="mx-auto" />
					<div className="modal-action">
						<form method="dialog">
							<button type="button" className="btn" onClick={closeDialog}>
								Close
							</button>
						</form>
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
