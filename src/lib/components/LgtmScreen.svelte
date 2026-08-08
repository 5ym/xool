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
	ghLogin?: string;
	xLinked?: boolean;
	recentImages: GalleryFile[];
	myImages: GalleryFile[];
};

let {
	message,
	wkey,
	isLoggedIn,
	ghLogin,
	xLinked,
	recentImages,
	myImages,
}: Props = $props();
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
		<p class="text-sm opacity-60">
			ログイン中:
			{[ghLogin && `GitHub (${ghLogin})`, xLinked && "𝕏"]
				.filter(Boolean)
				.join(" / ")}
		</p>
		{#if !ghLogin || !xLinked}
			<!-- Signing in the other way as well merges the two into one account,
			     so images uploaded under either one stay yours. -->
			<p class="text-sm opacity-60">
				もう一方でもログインすると同じアカウントに紐づきます
			</p>
			<SignInButton provider={ghLogin ? "x" : "github"} />
		{/if}
	{:else}
		<p>作成機能を利用するにはログインしてください</p>
		<div class="flex gap-3 not-prose">
			<SignInButton provider="github" />
			<SignInButton />
		</div>
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
