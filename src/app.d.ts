/// <reference types="vite/client" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			site: import("$lib/server/site").Site;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
