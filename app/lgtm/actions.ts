"use server";

import sharp from "sharp";

export async function create(files: FileList | null) {
	if (files === null) {
		return;
	}
	for (const file in files) {
		await sharp(await files[file].arrayBuffer()).resize(500).webp({quality: 80}).toFile('test.webp');
	}
}
