import { autoAction, type XPostMetrics } from "./client";
import db from "./db";
import type { Tweet, TweetMetric, User } from "./model";

// x.com only serves non-public and organic metrics for posts made within the
// last 30 days, and never backfills them. Snapshotting on a schedule is the only
// way to end up with a history longer than that window.
const METRIC_WINDOW_DAYS = 29;

// Snapshots are taken when someone opens the page rather than on a schedule, so
// this is how stale the newest one may get before a page view refreshes it.
const CAPTURE_INTERVAL_MS = 15 * 60_000;

export type Snapshot = Omit<TweetMetric, "id" | "tweetId">;
export type Counters = Omit<Snapshot, "capturedAt">;

export interface TweetHistory {
	tweetId: string;
	text: string;
	postedAt: number;
	snapshots: Snapshot[];
	latest?: Snapshot;
	/** Impressions gained since the previous snapshot. */
	delta: number;
}

const COUNTERS = [
	"impressions",
	"profileClicks",
	"linkClicks",
	"likes",
	"reposts",
	"replies",
	"quotes",
	"bookmarks",
] as const;

function countersOf(post: XPostMetrics): Counters {
	const nonPublic = post.non_public_metrics;
	const organic = post.organic_metrics;
	const shared = post.public_metrics;
	return {
		impressions:
			nonPublic?.impression_count ??
			organic?.impression_count ??
			shared?.impression_count ??
			0,
		profileClicks:
			nonPublic?.user_profile_clicks ?? organic?.user_profile_clicks ?? 0,
		linkClicks: nonPublic?.url_link_clicks ?? organic?.url_link_clicks ?? 0,
		likes: organic?.like_count ?? shared?.like_count ?? 0,
		reposts: organic?.retweet_count ?? shared?.retweet_count ?? 0,
		replies: organic?.reply_count ?? shared?.reply_count ?? 0,
		quotes: shared?.quote_count ?? 0,
		bookmarks: shared?.bookmark_count ?? 0,
	};
}

function unchanged(previous: Counters, next: Counters) {
	return COUNTERS.every((name) => previous[name] === next[name]);
}

function save(userKey: string, posts: XPostMetrics[], capturedAt: number) {
	const upsertTweet = db().prepare(`
		INSERT INTO tweet (tweetId, userKey, text, postedAt)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(tweetId) DO UPDATE SET text = excluded.text
	`);
	const previousOf = db().query<Counters, [string]>(`
		SELECT ${COUNTERS.join(", ")} FROM tweetMetric
		WHERE tweetId = ? ORDER BY capturedAt DESC LIMIT 1
	`);
	const insertMetric = db().prepare(`
		INSERT INTO tweetMetric (tweetId, capturedAt, ${COUNTERS.join(", ")})
		VALUES (?, ?, ${COUNTERS.map(() => "?").join(", ")})
	`);

	return db().transaction(() => {
		let saved = 0;
		for (const post of posts) {
			upsertTweet.run(post.id, userKey, post.text, Date.parse(post.created_at));
			const counters = countersOf(post);
			const previous = previousOf.get(post.id);
			// Polling faster than x.com refreshes its counters would otherwise pad
			// the history with points that carry no new information.
			if (previous !== null && unchanged(previous, counters)) continue;
			insertMetric.run(
				post.id,
				capturedAt,
				...COUNTERS.map((name) => counters[name]),
			);
			saved += 1;
		}
		return saved;
	})();
}

/** Records one snapshot of every post still inside the 30 day metric window. */
export async function capture(key: string) {
	const existUser = db()
		.query<User, [string]>("SELECT * FROM user WHERE key = ?")
		.get(key);
	if (existUser === null)
		return { error: "keyが無効です再ログインしてください" };

	const startTime = new Date(Date.now() - METRIC_WINDOW_DAYS * 86_400_000)
		.toISOString()
		.replace(/\.\d{3}Z$/, "Z");
	const ret = await autoAction("tweetMetrics", key, {
		id: existUser.socialId,
		startTime,
	});
	if (ret?.error !== undefined) return ret;

	const posts: XPostMetrics[] = ret?.data ?? [];
	const capturedAt = Date.now();
	return {
		capturedAt,
		posts: posts.length,
		saved: save(key, posts, capturedAt),
		rateLimit: ret?.rateLimit,
	};
}

export function lastCapturedAt(userKey: string): number | undefined {
	return (
		db()
			.query<{ capturedAt: number | null }, [string]>(`
				SELECT MAX(tweetMetric.capturedAt) AS capturedAt FROM tweetMetric
				JOIN tweet ON tweet.tweetId = tweetMetric.tweetId
				WHERE tweet.userKey = ?
			`)
			.get(userKey)?.capturedAt ?? undefined
	);
}

/**
 * Takes a snapshot unless a recent one already exists. Opening the page is what
 * drives the history forward, so there is nothing to schedule.
 */
export async function captureIfStale(key: string) {
	const last = lastCapturedAt(key);
	if (last !== undefined && Date.now() - last < CAPTURE_INTERVAL_MS) return;
	await capture(key);
}

export function history(userKey: string, limit = 20): TweetHistory[] {
	const tweets = db()
		.query<Tweet, [string, number]>(
			"SELECT * FROM tweet WHERE userKey = ? ORDER BY postedAt DESC LIMIT ?",
		)
		.all(userKey, limit);
	const snapshotsOf = db().query<Snapshot, [string]>(`
		SELECT capturedAt, ${COUNTERS.join(", ")} FROM tweetMetric
		WHERE tweetId = ? ORDER BY capturedAt
	`);

	return tweets.map((tweet) => {
		const snapshots = snapshotsOf.all(tweet.tweetId);
		const latest = snapshots.at(-1);
		const previous = snapshots.at(-2);
		return {
			tweetId: tweet.tweetId,
			text: tweet.text,
			postedAt: tweet.postedAt,
			snapshots,
			latest,
			delta: latest && previous ? latest.impressions - previous.impressions : 0,
		};
	});
}
