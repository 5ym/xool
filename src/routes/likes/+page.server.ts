import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const _wkey = cookies.get("key");
};
