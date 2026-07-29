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
	return instance;
}
