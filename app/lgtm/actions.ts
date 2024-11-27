"use server";

import type { LImage } from "@/utils/Model";
import mongo from "@/utils/db";
import sharp from "sharp";

export async function create(files: FileList | null, userKey: string) {
	if (files === null) {
		return;
	}
	const collection = (await mongo()).collection<LImage>("lImage");
	for await (const file of files) {
		const fileName = `${await generateKey()}.webp`;
		await sharp(await file.arrayBuffer(), { animated: true })
			.resize({
				width: 500,
				height: 500,
				fit: "inside",
			})
            .composite([
                {
                    input: 'utils/lgtm.webp',
                },
            ])
			.webp({ quality: 80 })
			.toFile(`public/images/${fileName}`);
		collection.insertOne({
			fileName: fileName,
			userKey: userKey,
			createdAt: new Date(),
		});
	}
}

async function generateKey() {
	const key = crypto.randomUUID();
	const existFile = Bun.file(`${key}.webp`);
	if (await existFile.exists()) return await generateKey();
	return key;
}
