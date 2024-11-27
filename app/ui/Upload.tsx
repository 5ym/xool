"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { create } from "../lgtm/actions";

export default function Upload({ userKey }: { userKey: string }) {
	const [isGenerating, setIsGenerating] = useState(false);
	const router = useRouter();
	const onSelectImage = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			setIsGenerating(true);
			await create(e.target.files, userKey);
			router.refresh();
			e.target.value = "";
			setIsGenerating(false);
		},
		[router, userKey],
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
					<progress className="progress w-56 ml-4" />
					<span className="ml-4">画像生成中</span>
				</>
			)}
		</div>
	);
}
