<script lang="ts">
import { browser } from "$app/environment";
import { afterNavigate, beforeNavigate } from "$app/navigation";
import { updated } from "$app/state";
import Nav from "$lib/components/Nav.svelte";
import Toast from "$lib/components/Toast.svelte";
import "../app.css";

let { children } = $props();

// A rolling update replaces the hashed asset filenames, so a tab opened before
// the deploy asks for chunks the new pods no longer have. Without this a click
// on a link just dies; instead we hand the navigation over to the browser,
// which reloads the page against whichever version is live now.
let staleAssets = false;
let pending: string | undefined;

beforeNavigate(({ willUnload, to }) => {
	if (willUnload || !to?.url) return;
	pending = to.url.href;
	// `updated` flips once the version poll below sees a new build.
	if (staleAssets || updated.current) location.href = to.url.href;
});

afterNavigate(() => {
	pending = undefined;
});

if (browser) {
	// Vite fires this when a lazily imported chunk 404s, which happens if the
	// poll has not run yet or the request reached a pod that was already
	// replaced. Hovering a link preloads code too, so only take over when a
	// navigation is actually in flight — otherwise just remember for the next
	// click rather than reloading the page under the user.
	addEventListener("vite:preloadError", (event) => {
		event.preventDefault();
		staleAssets = true;
		if (pending) location.href = pending;
	});
}
</script>

<svelte:head>
	<title>𝕏ool</title>
	<meta name="description" content="Tool for 𝕏" />
</svelte:head>

<nav class="navbar px-0">
	<div class="page-container flex items-center">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl" href="/">𝕏ool</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-0">
				<Nav />
			</ul>
		</div>
	</div>
</nav>
<main>
	{@render children()}
</main>
<Toast />
