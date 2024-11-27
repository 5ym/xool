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
		const buffer = await sharp(await file.arrayBuffer(), { animated: true })
			.resize({
				width: 500,
				height: 500,
				fit: "inside",
			})

			.webp({ quality: 80 })
			.toBuffer();
        const image = sharp(buffer)
        const metadata = await image.metadata()
        const lgtm = await sharp('utils/lgtm.webp')
            .resize({
                width: metadata.width,
                height: metadata.height,
                fit: "contain",
                background: { r:0, g:0, b:0, alpha: 0 }
            })
            .toBuffer()

            
        await sharp(buffer, {animated: true})
            .composite([{
                input: lgtm,
                tile: true,
                top: 0,
                left: 0,
            }])
            .toFile(`public/images/${fileName}`)
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
