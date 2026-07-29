import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;
	if (filename.includes("/") || filename.includes("..")) {
		return new Response("Not found", { status: 404 });
	}
	const file = Bun.file(`images/${filename}`);
	if (!(await file.exists())) {
		return new Response("Not found", { status: 404 });
	}
	return new Response(file);
};
