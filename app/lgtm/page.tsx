import type { LImage, User } from "@/utils/Model";
import mongo from "@/utils/db";
import { cookies } from "next/headers";
import Link from "next/link";
import CopyButton from "../ui/CopyButton";
import Gallery from "../ui/Gallery";
import Upload from "../ui/Upload";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
	const userCollection = (await mongo()).collection<User>("user");
	const existUser = await userCollection.findOne({ key: wkey });
	const imaageCollection = (await mongo()).collection<LImage>("lImage");
	const imageList = await imaageCollection
		.find()
		.limit(20)
		.sort("createdAt", -1)
		.toArray();

	return (
		<>
			<div className="prose mx-auto p-4">
				<h2>LGTM画像が生成できます</h2>
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
			<Gallery imageList={imageList} />
		</>
	);
}
