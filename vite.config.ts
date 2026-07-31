import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			version: {
				// The commit the image was built from, so every rollout publishes a
				// distinct version.json. Falls back to SvelteKit's build timestamp
				// when built outside CI.
				name: process.env.APP_VERSION || undefined,
				// Let already-open tabs notice a deploy on their own, rather than
				// only when a navigation has already failed.
				pollInterval: 60_000,
			},
		}),
	],
	server: {
		host: true,
	},
	ssr: {
		external: ["bun:sqlite"],
		// Bundle the highlighter into the server build rather than importing it
		// from node_modules at runtime, so only the language and theme actually
		// used are carried and shiki can stay a build-time dependency.
		noExternal: ["shiki", "@shikijs/langs", "@shikijs/themes"],
	},
	optimizeDeps: {
		exclude: ["bun:sqlite"],
	},
});
