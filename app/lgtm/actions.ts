"use server";

import { unlinkSync } from "node:fs";
import sharp from "sharp";
import db from "@/utils/db";
import { generateUniqueKey } from "@/utils/key";
import type { File } from "../ui/Gallery";

export async function create(files: FileList | null, userKey: string) {
	if (files === null) {
		return;
	}
	const lgtmSource = await Bun.file("public/lgtm.webp").arrayBuffer();
	for await (const file of files) {
		const fileName = `${await generateUniqueKey((k) => Bun.file(`images/${k}.webp`).exists())}.webp`;
		const buffer = await sharp(await file.arrayBuffer(), { animated: true })
			.resize({
				width: 960,
				height: 960,
				fit: "inside",
			})
			.rotate()
			.webp({ quality: 80 })
			.toBuffer();
		const image = sharp(buffer);
		const metadata = await image.metadata();
		const lgtm = await sharp(lgtmSource)
			.resize({
				width: metadata.width,
				height: metadata.height,
				fit: "contain",
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.toBuffer();

		await sharp(buffer, { animated: true })
			.composite([
				{
					input: lgtm,
					tile: true,
					top: 0,
					left: 0,
				},
			])
			.toFile(`images/${fileName}`);
		db().run(
			"INSERT INTO lImage (fileName, userKey, createdAt) VALUES (?, ?, ?)",
			[fileName, userKey, Date.now()],
		);
	}
}

export async function deleteFile(fileName: string) {
	db().run("DELETE FROM lImage WHERE fileName = ?", [fileName]);
	unlinkSync(`images/${fileName}`);
}

export async function get(
	page: number,
	find: boolean,
	userKey?: string,
): Promise<File[]> {
	const perPage = 30;
	const offset = (page - 1) * perPage;
	const rows = find
		? db()
				.query<{ fileName: string; userKey: string }, [string, number, number]>(
					"SELECT fileName, userKey FROM lImage WHERE userKey = ? ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?",
				)
				.all(userKey ?? "", perPage, offset)
		: db()
				.query<{ fileName: string; userKey: string }, [number, number]>(
					"SELECT fileName, userKey FROM lImage ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?",
				)
				.all(perPage, offset);

	return rows.map((image) => ({
		name: image.fileName,
		isDeletable: image.userKey === userKey,
	}));
}
