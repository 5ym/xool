"use server";

import { unlinkSync } from "node:fs";
import type { LImage } from "@/utils/Model";
import mongo from "@/utils/db";
import sharp from "sharp";
import type { Collection, FindCursor, WithId } from "mongodb";
import type { File } from "../ui/Gallery";

export async function create(files: FileList | null, userKey: string) {
	if (files === null) {
		return;
	}
	const collection = (await mongo()).collection<LImage>("lImage");
	for await (const file of files) {
		const fileName = `${await generateKey()}.webp`;
		const buffer = await sharp(await file.arrayBuffer(), { animated: true })
			.resize({
				width: 500,
				height: 500,
				fit: "inside",
			})
			.rotate()
			.webp({ quality: 80 })
			.toBuffer();
		const image = sharp(buffer);
		const metadata = await image.metadata();
		const lgtm = await sharp("public/lgtm.webp")
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
		collection.insertOne({
			fileName: fileName,
			userKey: userKey,
			createdAt: new Date(),
		});
	}
}

export async function deleteFile(fileName: string) {
	await (await mongo()).collection<LImage>("lImage").deleteOne({
		fileName: fileName,
	});
	unlinkSync(`images/${fileName}`);
}

async function generateKey() {
	const key = crypto.randomUUID();
	const existFile = Bun.file(`images/${key}.webp`);
	if (await existFile.exists()) return await generateKey();
	return key;
}

export async function get(
	page: number,
	find: boolean,
	userKey?: string,
): Promise<File[]> {
	const collection = (await mongo()).collection<LImage>("lImage");
	const perPage = 30;
	let list: FindCursor<WithId<LImage>>;
	if (find) {
		list = collection.find({ userKey: userKey });
	} else {
		list = collection.find();
	}
	const array = await list
		.sort({
			createdAt: -1,
			_id: -1,
		})
		.skip((page - 1) * perPage)
		.limit(page * perPage)
		.toArray();

	return array.map((image) => ({
		name: image.fileName,
		isDeletable: image.userKey === userKey,
	}));
}
