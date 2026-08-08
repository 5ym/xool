import { autoAction, type OwnPost } from "./client";
import db from "./db";
import type { Summary, User } from "./model";

// Everything here is reckoned in JST: the day a summary covers is the day the
// person posting it lived through, not the one UTC happened to be on.
const JST_OFFSET_MS = 9 * 3_600_000;

/** The JST calendar date an instant falls on, as YYYY-MM-DD. */
function jstDate(at: number): string {
	return new Date(at + JST_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
	return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000)
		.toISOString()
		.slice(0, 10);
}

/** Midnight JST at the start of a date, as the UTC instant x.com asks for. */
function jstMidnight(date: string): string {
	return new Date(Date.parse(`${date}T00:00:00Z`) - JST_OFFSET_MS)
		.toISOString()
		.replace(/\.\d{3}Z$/, "Z");
}

export function getSummary(userKey: string): Summary | null {
	return db()
		.query<Summary, [string]>("SELECT * FROM summary WHERE userKey = ?")
		.get(userKey);
}

export function setEnabled(userKey: string, enabled: boolean) {
	// Start the clock on yesterday. Otherwise switching this on at noon posts a
	// summary for a day that ended hours ago, which reads as the tool talking
	// out of turn.
	db().run(
		`INSERT INTO summary (userKey, enabled, lastSummarizedOn) VALUES (?, ?, ?)
		 ON CONFLICT(userKey) DO UPDATE SET
			enabled = excluded.enabled,
			lastSummarizedOn = excluded.lastSummarizedOn,
			lastError = NULL`,
		[userKey, enabled ? 1 : 0, addDays(jstDate(Date.now()), -1)],
	);
}

const numberFormat = new Intl.NumberFormat("ja-JP");

export function summaryText(date: string, posts: OwnPost[]): string {
	const [, month, day] = date.split("-");
	const total = (pick: (post: OwnPost) => number | undefined) =>
		posts.reduce((sum, post) => sum + (pick(post) ?? 0), 0);

	const likes = total((post) => post.public_metrics?.like_count);
	const reposts = total((post) => post.public_metrics?.retweet_count);
	const impressions = total(
		(post) => post.non_public_metrics?.impression_count,
	);

	return [
		`${Number(month)}月${Number(day)}日のポスト: ${posts.length}件`,
		`いいね ${numberFormat.format(likes)}・リポスト ${numberFormat.format(reposts)}`,
		`インプレッション ${numberFormat.format(impressions)}`,
		"",
		"#ツイ廃アラート",
	].join("\n");
}

async function postSummary(row: Summary, date: string) {
	const user = db()
		.query<User, [string]>("SELECT * FROM user WHERE key = ?")
		.get(row.userKey);
	if (user === null) return;

	let lastError: string | null = null;
	let lastPostId: string | null = row.lastPostId;

	const ret = await autoAction("ownPosts", row.userKey, {
		id: user.socialId,
		startTime: jstMidnight(date),
		endTime: jstMidnight(addDays(date, 1)),
	});
	const status = ret?.rateLimit?.httpStatus;

	if (ret?.error !== undefined) {
		lastError = ret.error;
	} else if (status !== undefined && status >= 400) {
		lastError = `𝕏がポストの取得を拒否しました (${status})`;
	} else {
		// Yesterday's summary was posted after midnight, so it lands inside this
		// window and would count itself.
		const all: OwnPost[] = ret?.data ?? [];
		const posts = all.filter((post) => post.id !== row.lastPostId);
		// A day with nothing on it is not worth a post, and x.com charges for
		// every one of them.
		if (posts.length > 0) {
			const posted = await autoAction("tweet", row.userKey, {
				text: summaryText(date, posts),
			});
			if (posted?.error !== undefined) {
				lastError = posted.error;
			} else if (posted?.rateLimit?.httpStatus >= 400) {
				lastError = `𝕏がポストを拒否しました (${posted.rateLimit.httpStatus})`;
			} else {
				lastPostId = posted?.data?.id ?? null;
			}
		}
	}

	// The date is recorded whether or not it worked, so a failure costs one
	// attempt rather than one every time the timer fires.
	db().run(
		"UPDATE summary SET lastSummarizedOn = ?, lastPostId = ?, lastError = ? WHERE userKey = ?",
		[date, lastPostId, lastError, row.userKey],
	);
}

/**
 * Posts the summary for the day that has just ended to everyone who asked for
 * one and has not had it yet. Safe to call as often as you like: a day already
 * summarised is skipped, so restarts and overlapping ticks do not repost.
 */
export async function postDueSummaries(now = Date.now()) {
	const date = addDays(jstDate(now), -1);
	const due = db()
		.query<Summary, [string]>(
			"SELECT * FROM summary WHERE enabled = 1 AND (lastSummarizedOn IS NULL OR lastSummarizedOn < ?)",
		)
		.all(date);

	for (const row of due) {
		await postSummary(row, date);
	}
	return due.length;
}
