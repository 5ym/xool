import type User from "@/utils/UserModel";
import mongo from "@/utils/db";
import { cookies } from "next/headers";
import Link from "next/link";
import Upload from "../ui/Upload";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
	const collection = (await mongo()).collection<User>("user");
	const existUser = await collection.findOne({ key: wkey });

	return (
		<div className="prose mx-auto">
			<h2>LGTM画像を生成するウェブアプリです。</h2>
			{existUser ? (
				<Upload />
			) : (
				<>
					<p>利用にはまずログインしてください</p>
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
	);
}
