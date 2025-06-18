import { type NextRequest, NextResponse } from "next/server";
import { autoAction } from "@/utils/client";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const key = searchParams.get("key");
	const id = searchParams.get("id");
	if (!key || !id) {
		return NextResponse.json(
			{ message: "key, idを指定してください" },
			{ status: 400 },
		);
	}

	return NextResponse.json(await autoAction("userTweets", key, { id }));
}
