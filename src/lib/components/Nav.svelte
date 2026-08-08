<script lang="ts">
import { page } from "$app/state";
</script>

<li>
	<a href="/" class={page.url.pathname === "/" ? "active" : ""}>ホーム</a>
</li>
<li>
	<a href="/lgtm" class={page.url.pathname === "/lgtm" ? "active" : ""}>LGTM</a>
</li>
