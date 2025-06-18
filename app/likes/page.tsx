import { cookies } from "next/headers";

export default async function Page() {
	const cookieStore = await cookies();
	const _wkey = cookieStore.get("key")?.value;
}
