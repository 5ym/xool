import type { LImage } from "@/utils/Model";
import mongo from "@/utils/db";
import type { WithId } from "mongodb";
import Gallery from "./Gallery";

export default async function GalleryWrapper({
	userKey,
}: { userKey?: string }) {
	const imaageCollection = (await mongo()).collection<LImage>("lImage");
	let imageList: WithId<LImage>[] = [];
	if (userKey) {
		imageList = await imaageCollection
			.find({ userKey: userKey })
			.sort("createdAt", -1)
			.toArray();
	} else {
		imageList = await imaageCollection
			.find()
			.limit(20)
			.sort("createdAt", -1)
			.toArray();
	}
	const fileNameList = imageList.map((image) => image.fileName);

	return <Gallery fileNameList={fileNameList} />;
}
