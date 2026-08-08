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
		CREATE TABLE IF NOT EXISTS summary (
			userKey TEXT PRIMARY KEY,
			enabled INTEGER NOT NULL,
			lastSummarizedOn TEXT,
			lastPostId TEXT,
			lastError TEXT
		)
	`);
	// The metrics page is gone and so are the tables it filled. This runs on
	// every boot because there is no migration runner to run it once; both
	// statements are no-ops on a database that has already seen them.
	instance.run("DROP TABLE IF EXISTS tweetMetric");
	instance.run("DROP TABLE IF EXISTS tweet");
	return instance;
}
