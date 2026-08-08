import { isAdmin } from "$lib/server/admin";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies, locals }) => ({
	site: locals.site,
	isAdmin: isAdmin(cookies.get("key")),
});
