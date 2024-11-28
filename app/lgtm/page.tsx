import type { LImage, User } from "@/utils/Model";
import mongo from "@/utils/db";
import { cookies } from "next/headers";
import Link from "next/link";
import GalleryWrapper from "../ui/GalleryWrapper";
import Upload from "../ui/Upload";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
	const userCollection = (await mongo()).collection<User>("user");
	const existUser = await userCollection.findOne({ key: wkey });

	return (
		<>
			<div className="prose mx-auto p-4">
				<p>
					LGTM画像が生成できます
					<br />
					Tenor等から直接ドラッグアンドドロップでも登録できます
				</p>
				{existUser && wkey ? (
					<Upload userKey={wkey} />
				) : (
					<>
						<p>作成機能を利用するにはログインしてください</p>
						<Link
							href="/api/oauth?redirect=lgtm"
							className="text-white bg-black btn"
						>
							<span>Sign in with</span>
							<span className="text-2xl">𝕏</span>
						</Link>
					</>
				)}
			</div>
			<div role="tablist" className="tabs tabs-bordered mb-3">
				<input
					type="radio"
					name="my_tabs_1"
					role="tab"
					className="tab min-w-20 ml-4 md:min-w-80"
					aria-label="新着"
					defaultChecked
				/>
				<div role="tabpanel" className="tab-content">
					<GalleryWrapper />
				</div>

				<input
					type="radio"
					name="my_tabs_1"
					role="tab"
					className="tab min-w-20 md:min-w-80"
					aria-label="自分"
				/>
				<div role="tabpanel" className="tab-content">
					{wkey ? (
						<GalleryWrapper userKey={wkey} />
					) : (
						<Link
							href="/api/oauth?redirect=lgtm"
							className="text-white bg-black btn"
						>
							<span>Sign in with</span>
							<span className="text-2xl">𝕏</span>
						</Link>
					)}
				</div>
				<span className="tab mr-4"/>
			</div>
		</>
	);
}
