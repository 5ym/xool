"use client";

import { useCallback, useState } from "react";
import { create } from "../lgtm/actions";

export default function Upload() {
	const [isGenerating, setIsGenerating] = useState(false);
	const onSelectImage = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			create(e.target.files);
		},
		[],
	);

	return (
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
					<progress className="progress w-56" />
					<span className="ml-4">画像生成中です</span>
				</>
			)}
		</div>
	);
}
