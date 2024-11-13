import { cookies } from "next/headers";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
}
