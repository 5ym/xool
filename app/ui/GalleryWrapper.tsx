import type { LImage } from "@/utils/Model";
import mongo from "@/utils/db";
import type { WithId } from "mongodb";
import Gallery from "./Gallery";

export default async function GalleryWrapper({
	userKey,
	tab,
}: { userKey?: string; tab: number }) {
	const imaageCollection = (await mongo()).collection<LImage>("lImage");
	let imageList: WithId<LImage>[] = [];
	if (tab === 0) {
		imageList = await imaageCollection
			.find()
			.limit(20)
			.sort("createdAt", -1)
			.toArray();
	} else {
		imageList = await imaageCollection
			.find({ userKey: userKey })
			.sort("createdAt", -1)
			.toArray();
	}
	const fileNameList = imageList.map((image) => ({
		name: image.fileName,
		isDeletable: image.userKey === userKey,
	}));

	return <Gallery fileNameList={fileNameList} />;
}
