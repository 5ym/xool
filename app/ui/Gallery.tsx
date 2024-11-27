"use client";

import type { LImage } from "@/utils/Model";
import type { WithId } from "mongodb";
import CopyButton from "./CopyButton";

export default function Gallery({
	imageList,
}: { imageList: WithId<LImage>[] }) {
	const onClickItem = () => {};
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div className="flex flex-wrap h-full gap-3" onClick={onClickItem}>
			{imageList.map((image) => (
				<div
					key={image.fileName}
					className="relative group/item grow max-h-[30%] cursor-pointer rounded-3xl overflow-hidden"
				>
					<CopyButton fileName={image.fileName} />
					<img
						src={`/images/${image.fileName}`}
						alt="LGTM"
						className="h-full w-full object-cover group-hover/item:w-auto mx-auto"
					/>
				</div>
			))}
		</div>
	);
}
