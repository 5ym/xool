"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get } from "../lgtm/actions";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";

export type File = {
	name: string;
	isDeletable: boolean;
};

export default function Gallery({
	fileNameList,
	userKey,
	find,
}: {
	fileNameList: File[];
	userKey?: string;
	find: boolean;
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
	const [isGetting, setIsGetting] = useState<boolean>(false);
	const [list, setList] = useState<File[]>([]);
	const viewList = useMemo(
		() => [...fileNameList, ...list],
		[fileNameList, list],
	);
	const [page, setPage] = useState(2);
	const handleScroll = useCallback(async () => {
		console.log(
			document.body.scrollHeight - (window.innerHeight + window.scrollY),
		);
		if (
			document.body.scrollHeight - (window.innerHeight + window.scrollY) <
				300 &&
			isGetting === false
		) {
			setIsGetting(true);
			const pageList = await get(page, find, userKey);
			setList([...list, ...pageList]);
			setPage(page + 1);
			if (pageList.length === 30) setIsGetting(false);
		}
	}, [find, isGetting, list, page, userKey]);

	useEffect(() => {
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [handleScroll]);
	useEffect(() => {
		if (fileNameList) {
			setList([]);
			setPage(2);
			setIsGetting(false);
		}
	}, [fileNameList]);
	return (
		<>
			<div className="flex flex-wrap gap-3 overflow-x-hidden overflo-y-visible py-3">
				{viewList.map((file) => (
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
