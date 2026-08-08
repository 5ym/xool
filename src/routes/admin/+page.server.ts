import { error } from "@sveltejs/kit";
import { isAdmin, lgtmAdmin, summaryAdmin } from "$lib/server/admin";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies, locals }) => {
	// 404 rather than 403: there is no reason to tell anyone this page is here.
	if (!isAdmin(cookies.get("key"))) error(404, "Not found");

	return locals.site === "lgtm"
		? { site: "lgtm" as const, lgtm: lgtmAdmin() }
		: { site: "xool" as const, summary: summaryAdmin() };
};
