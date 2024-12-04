"use client";

import { useRef, useState } from "react";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";

export type File = {
	name: string;
	isDeletable: boolean;
};

export default function Gallery({
	fileNameList,
}: {
	fileNameList: File[];
}) {
	const [diaImage, setDiaImage] = useState<File>();
	const dialog = useRef<HTMLDialogElement>(null);
	const onClickItem = (file: File) => {
		setDiaImage(file);
		dialog.current?.showModal();
	};
	const closeDialog = () => {
		dialog.current?.close();
	};
	return (
		<>
			<div className="flex flex-wrap gap-3 overflow-x-hidden overflo-y-visible py-3">
				{fileNameList.map((file) => (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						key={file.name}
						className="relative grow h-64 max-w-lg cursor-pointer rounded-3xl overflow-hidden bg-primary-content hover:scale-105 transition-all"
						onClick={() => onClickItem(file)}
					>
						{file.isDeletable && <DeleteButton fileName={file.name} />}
						<CopyButton fileName={file.name} />
						<img
							src={`/images/${file.name}`}
							alt="LGTM"
							className="h-full w-full object-cover"
						/>
					</div>
				))}
			</div>
			<dialog ref={dialog} className="modal">
				<div className="modal-box w-auto">
					<div className="relative group/item">
						{diaImage ? (
							<>
								{diaImage.isDeletable && (
									<DeleteButton fileName={diaImage.name} isVisible={false} />
								)}
								<CopyButton
									fileName={diaImage.name}
									onClick={closeDialog}
									isVisible={false}
								/>
								<img src={`/images/${diaImage.name}`} alt="LGTM" />
							</>
						) : (
							<div className="skeleton h-full w-full" />
						)}
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
