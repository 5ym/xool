import { cookies } from "next/headers";
import mongo from "@/utils/db";
import type { User } from "@/utils/Model";
import Gallery from "../ui/Gallery";
import SignInButton from "../ui/SignInButton";
import Upload from "../ui/Upload";
import { get } from "./actions";

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
						<SignInButton redirect="lgtm" />
					</>
				)}
			</div>
			<div role="tablist" className="tabs tabs-border tabs-xl mb-3">
				<input
					type="radio"
					name="my_tabs_1"
					role="tab"
					className="tab"
					aria-label="新着"
					defaultChecked
				/>
				<div role="tabpanel" className="tab-content">
					<Gallery
						fileNameList={await get(1, false, wkey)}
						userKey={wkey}
						find={false}
					/>
				</div>

				<input
					type="radio"
					name="my_tabs_1"
					role="tab"
					className="tab"
					aria-label="自分"
				/>
				<div role="tabpanel" className="tab-content">
					{wkey ? (
						<Gallery
							fileNameList={await get(1, true, wkey)}
							userKey={wkey}
							find={true}
						/>
					) : (
						<p>作成機能を利用するにはログインしてください</p>
					)}
				</div>
				<span className="tab mr-4" />
			</div>
		</>
	);
}
