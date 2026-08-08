import { LGTM_HOST } from "./env";

export type Site = "lgtm" | "xool";

/**
 * Which of the two tools a request belongs to. One deployment answers both
 * hostnames, so this is the only thing that separates them.
 */
export function siteOf(url: URL): Site {
	return LGTM_HOST !== undefined && url.host === LGTM_HOST ? "lgtm" : "xool";
}
