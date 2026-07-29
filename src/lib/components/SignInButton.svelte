<script lang="ts">
let { redirect }: { redirect?: string } = $props();
</script>

<a
	href={redirect ? `/api/oauth?redirect=${redirect}` : "/api/oauth"}
	class="text-white bg-black btn"
>
	<span>Sign in with</span>
	<span class="text-2xl">𝕏</span>
</a>
