import { NextResponse } from "next/server";
import { autoAction } from "@/utils/client";

export async function POST(req: Request) {
	const { key, text, media } = await req.json();

	return NextResponse.json(await autoAction("tweet", key, { text, media }));
}
