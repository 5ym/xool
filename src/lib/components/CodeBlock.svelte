<script lang="ts">
import CopyButton from "./CopyButton.svelte";

let { html, code }: { html: string; code: string } = $props();
</script>

<!--
	The button is positioned against this wrapper rather than the highlighted
	<pre>, which arrives as markup from the highlighter and has nowhere to put it.
-->
<div class="relative">
	{@html html}
	<CopyButton text={() => code} message="コマンドをコピーしました" />
</div>
