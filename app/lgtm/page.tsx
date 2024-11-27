import type { LImage, User } from "@/utils/Model";
import mongo from "@/utils/db";
import { cookies } from "next/headers";
import Link from "next/link";
import CopyButton from "../ui/CopyButton";
import Upload from "../ui/Upload";
import styles from "./Image.module.css";

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
			<div className="prose mx-auto mb-4">
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
			<div className="flex flex-wrap justify-center items-center">
				{imageList.map((image) => (
					<div key={image.fileName} className={styles.image}>
						<CopyButton fileName={image.fileName} />
						<img src={`/images/${image.fileName}`} alt="LGTM" />
					</div>
				))}
			</div>
		</>
	);
}
