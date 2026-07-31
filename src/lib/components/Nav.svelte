<script lang="ts">
import { page } from "$app/state";
</script>

<li>
	<a href="/" class={page.url.pathname === "/" ? "active" : ""}>Webhook</a>
</li>
<li>
	<a href="/metrics" class={page.url.pathname === "/metrics" ? "active" : ""}>
		Metrics
	</a>
</li>
<li>
	<a href="/lgtm" class={page.url.pathname === "/lgtm" ? "active" : ""}>LGTM</a>
</li>
