"use server";

import { unlinkSync } from "node:fs";
import sharp from "sharp";
import mongo from "@/utils/db";
import { generateUniqueKey } from "@/utils/key";
import type { LImage } from "@/utils/Model";
import type { File } from "../ui/Gallery";

export async function create(files: FileList | null, userKey: string) {
	if (files === null) {
		return;
	}
	const collection = (await mongo()).collection<LImage>("lImage");
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
		collection.insertOne({ fileName, userKey, createdAt: new Date() });
	}
}

export async function deleteFile(fileName: string) {
	await (await mongo()).collection<LImage>("lImage").deleteOne({ fileName });
	unlinkSync(`images/${fileName}`);
}

export async function get(
	page: number,
	find: boolean,
	userKey?: string,
): Promise<File[]> {
	const perPage = 30;
	const imageCollection = (await mongo()).collection<LImage>("lImage");
	const list = find
		? imageCollection.find({ userKey })
		: imageCollection.find();
	const array = await list
		.sort({
			createdAt: -1,
			_id: -1,
		})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.toArray();

	return array.map((image) => ({
		name: image.fileName,
		isDeletable: image.userKey === userKey,
	}));
}
