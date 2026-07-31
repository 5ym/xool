import type { Database as DatabaseType } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let instance: DatabaseType | undefined;

export default function db(): DatabaseType {
	if (instance) return instance;
	const { Database } = require("bun:sqlite") as typeof import("bun:sqlite");
	const path = process.env.DB_PATH ?? "data/xool.db";
	mkdirSync(dirname(path), { recursive: true });
	instance = new Database(path);
	instance.exec("PRAGMA journal_mode = WAL;");
	// During a rolling update the outgoing and incoming pod share this file for
	// a few seconds. WAL lets them read concurrently; this makes the one writer
	// at a time wait its turn instead of failing with SQLITE_BUSY.
	instance.exec("PRAGMA busy_timeout = 5000;");
	instance.run(`
		CREATE TABLE IF NOT EXISTS user (
			key TEXT PRIMARY KEY,
			socialId TEXT NOT NULL UNIQUE,
			accessToken TEXT NOT NULL,
			refreshToken TEXT NOT NULL
		)
	`);
	instance.run(`
		CREATE TABLE IF NOT EXISTS lImage (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			fileName TEXT NOT NULL UNIQUE,
			userKey TEXT NOT NULL,
			createdAt INTEGER NOT NULL
		)
	`);
	instance.run("CREATE INDEX IF NOT EXISTS lImage_userKey ON lImage(userKey)");
	instance.run(`
		CREATE TABLE IF NOT EXISTS tweet (
			tweetId TEXT PRIMARY KEY,
			userKey TEXT NOT NULL,
			text TEXT NOT NULL,
			postedAt INTEGER NOT NULL
		)
	`);
	instance.run(
		"CREATE INDEX IF NOT EXISTS tweet_userKey ON tweet(userKey, postedAt DESC)",
	);
	instance.run(`
		CREATE TABLE IF NOT EXISTS tweetMetric (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tweetId TEXT NOT NULL,
			capturedAt INTEGER NOT NULL,
			impressions INTEGER NOT NULL,
			profileClicks INTEGER NOT NULL,
			linkClicks INTEGER NOT NULL,
			likes INTEGER NOT NULL,
			reposts INTEGER NOT NULL,
			replies INTEGER NOT NULL,
			quotes INTEGER NOT NULL,
			bookmarks INTEGER NOT NULL
		)
	`);
	instance.run(
		"CREATE INDEX IF NOT EXISTS tweetMetric_tweetId ON tweetMetric(tweetId, capturedAt)",
	);
	return instance;
}
