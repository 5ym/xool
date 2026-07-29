export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ filename: string }> },
) {
	const { filename } = await params;
	if (filename.includes("/") || filename.includes("..")) {
		return new Response("Not found", { status: 404 });
	}
	const file = Bun.file(`images/${filename}`);
	if (!(await file.exists())) {
		return new Response("Not found", { status: 404 });
	}
	return new Response(file);
}
