<script lang="ts">
import Nav from "$lib/components/Nav.svelte";
import Toast from "$lib/components/Toast.svelte";
import "../app.css";

let { children } = $props();
</script>

<svelte:head>
	<title>𝕏ool</title>
	<meta name="description" content="Tool for 𝕏" />
</svelte:head>

<nav class="navbar">
	<div class="flex-1">
		<a class="btn btn-ghost text-xl" href="/">𝕏ool</a>
	</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			<Nav />
		</ul>
	</div>
</nav>
<main>
	{@render children()}
</main>
<Toast />
