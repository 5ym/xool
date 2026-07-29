import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
		}),
	],
	server: {
		host: true,
	},
	ssr: {
		external: ["bun:sqlite"],
	},
	optimizeDeps: {
		exclude: ["bun:sqlite"],
	},
});
