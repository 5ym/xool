import CodeBlock from "@/app/ui/CodeBlock";
import type { User } from "@/utils/Model";
import mongo from "@/utils/db";
import { cookies } from "next/headers";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
	const collection = (await mongo()).collection<User>("user");
	const existUser = await collection.findOne({ key: wkey });
	return (
		<div className="p-4 flex justify-center">
			<CodeBlock
				code={`{
	"accsesToken": "${existUser?.accessToken}",
	"refreshToken": "${existUser?.refreshToken}"
}`}
				lang="json"
			/>
		</div>
	);
}
