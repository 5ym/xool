<script lang="ts">
import ErrorAlert from "$lib/components/ErrorAlert.svelte";
import type { File as GalleryFile } from "$lib/components/Gallery.svelte";
import Gallery from "$lib/components/Gallery.svelte";
import SignInButton from "$lib/components/SignInButton.svelte";
import Upload from "$lib/components/Upload.svelte";

type Props = {
	message?: string;
	wkey?: string;
	isLoggedIn: boolean;
	recentImages: GalleryFile[];
	myImages: GalleryFile[];
};

let { message, wkey, isLoggedIn, recentImages, myImages }: Props = $props();
</script>

<div class="prose mx-auto p-4">
	<p>
		LGTM画像が生成できます
		<br />
		Tenor等から直接ドラッグアンドドロップでも登録できます
	</p>
	{#if message !== undefined}
		<ErrorAlert>{message}</ErrorAlert>
	{/if}
	{#if isLoggedIn && wkey}
		<Upload />
	{:else}
		<p>作成機能を利用するにはGitHubでログインしてください</p>
		<SignInButton provider="github" />
	{/if}
</div>
<div role="tablist" class="tabs tabs-border tabs-xl mb-3">
	<input
		type="radio"
		name="my_tabs_1"
		role="tab"
		class="tab"
		aria-label="新着"
		checked
	/>
	<div role="tabpanel" class="tab-content">
		<Gallery
			fileNameList={recentImages}
			userKey={wkey}
			find={false}
		/>
	</div>

	<input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="自分" />
	<div role="tabpanel" class="tab-content">
		{#if wkey}
			<Gallery fileNameList={myImages} userKey={wkey} find={true} />
		{:else}
			<p>作成機能を利用するにはログインしてください</p>
		{/if}
	</div>
	<span class="tab mr-4"></span>
</div>
