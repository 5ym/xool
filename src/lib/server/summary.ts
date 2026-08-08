import { autoAction, type OwnPost } from "./client";
import db from "./db";
import type { Summary, SummaryDay, User } from "./model";

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
const n = (value: number) => numberFormat.format(value);

/** How many days up to and including `date` were posted on, without a gap. */
function streakEndingOn(userKey: string, date: string): number {
	const days = db()
		.query<{ date: string; posts: number }, [string, string]>(
			"SELECT date, posts FROM summaryDay WHERE userKey = ? AND date <= ? ORDER BY date DESC LIMIT 400",
		)
		.all(userKey, date);

	let streak = 0;
	let expected = date;
	for (const day of days) {
		// A missing row is a day this never ran for, which is not evidence of
		// having posted, so it ends the streak just like an empty day does.
		if (day.date !== expected || day.posts === 0) break;
		streak++;
		expected = addDays(expected, -1);
	}
	return streak;
}

export function summaryText(
	date: string,
	posts: OwnPost[],
	previous?: SummaryDay,
	streak = 0,
): string {
	const [, month, day] = date.split("-");
	const total = (pick: (post: OwnPost) => number | undefined) =>
		posts.reduce((sum, post) => sum + (pick(post) ?? 0), 0);

	const replies = posts.filter((post) => post.in_reply_to_user_id).length;
	const likes = total((post) => post.public_metrics?.like_count);
	const reposts = total((post) => post.public_metrics?.retweet_count);
	const replied = total((post) => post.public_metrics?.reply_count);
	const bookmarks = total((post) => post.public_metrics?.bookmark_count);
	const impressions = total((p) => p.non_public_metrics?.impression_count);
	const profileClicks = total((p) => p.non_public_metrics?.user_profile_clicks);
	const linkClicks = total((p) => p.non_public_metrics?.url_link_clicks);
	const best = Math.max(
		0,
		...posts.map((p) => p.non_public_metrics?.impression_count ?? 0),
	);

	const diff =
		previous === undefined
			? ""
			: ` (前日比 ${signed(posts.length - previous.posts)})`;
	// A line whose numbers are all zero says nothing, and every one of them
	// spends part of a post nobody asked to be long.
	const lines = [
		`${Number(month)}月${Number(day)}日のポスト: ${posts.length}件${diff}`,
		replies > 0 && `うちリプライ ${replies}件`,
		`いいね ${n(likes)}・リポスト ${n(reposts)}・返信 ${n(replied)}・ブックマーク ${n(bookmarks)}`,
		impressions > 0 &&
			`インプレッション ${n(impressions)} (平均 ${n(Math.round(impressions / posts.length))}・最高 ${n(best)})`,
		profileClicks + linkClicks > 0 &&
			`プロフィールクリック ${n(profileClicks)}・リンククリック ${n(linkClicks)}`,
		streak > 1 && `${streak}日連続でポスト中`,
	].filter((line) => typeof line === "string");

	return [...lines, "", "#ツイ廃アラート"].join("\n");
}

function signed(value: number): string {
	return value > 0 ? `+${value}` : `${value}`;
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
		const impressions = posts.reduce(
			(sum, post) => sum + (post.non_public_metrics?.impression_count ?? 0),
			0,
		);
		const previous = db()
			.query<SummaryDay, [string, string]>(
				"SELECT * FROM summaryDay WHERE userKey = ? AND date = ?",
			)
			.get(row.userKey, addDays(date, -1));
		db().run(
			"INSERT OR REPLACE INTO summaryDay (userKey, date, posts, impressions) VALUES (?, ?, ?, ?)",
			[row.userKey, date, posts.length, impressions],
		);

		// A day with nothing on it is not worth a post, and x.com charges for
		// every one of them.
		if (posts.length > 0) {
			const posted = await autoAction("tweet", row.userKey, {
				text: summaryText(
					date,
					posts,
					previous ?? undefined,
					streakEndingOn(row.userKey, date),
				),
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
