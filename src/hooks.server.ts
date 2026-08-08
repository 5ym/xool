import { building } from "$app/environment";
import { postDueSummaries } from "$lib/server/summary";

// Nothing here schedules to the minute. The check is idempotent and only ever
// acts on a day that has already ended, so waking up every so often and asking
// "is yesterday still unsummarised?" survives restarts and rollouts, which a
// timer aimed at midnight would not.
const CHECK_INTERVAL_MS = 5 * 60_000;

if (!building) {
	const tick = () =>
		postDueSummaries().catch((error) =>
			console.error("daily summary failed", error),
		);
	tick();
	setInterval(tick, CHECK_INTERVAL_MS);
}
