<script lang="ts" module>
export type File = { name: string; isDeletable: boolean };
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import CopyButton from "./CopyButton.svelte";
	import DeleteButton from "./DeleteButton.svelte";

	let {
		fileNameList,
		userKey,
		find,
	}: {
		fileNameList: File[];
		userKey?: string;
		find: boolean;
	} = $props();

	// Seeds SSR output with the initial page; the $effect below only
	// re-syncs on later prop changes (e.g. switching tabs), client-side.
	// Reading the prop through untrack says that capturing just this first
	// value is the point, rather than an oversight the compiler should flag.
	let items = $state<File[]>(untrack(() => fileNameList));
	let page = $state(2);
	let isGetting = $state(false);
	let diaImage = $state<File>();
	let dialog: HTMLDialogElement | undefined = $state();

	function onClickItem(file: File) {
		diaImage = file;
		dialog?.showModal();
	}
	function closeDialog() {
		dialog?.close();
	}

	function removeItem(fileName: string) {
		items = items.filter((f) => f.name !== fileName);
	}

	async function handleScroll() {
		if (
			document.body.scrollHeight - (window.innerHeight + window.scrollY) <
				300 &&
			!isGetting
		) {
			isGetting = true;
			const res = await fetch(`/lgtm/images?page=${page}&find=${find}`);
			const pageList: File[] = await res.json();
			items = [...items, ...pageList];
			page += 1;
			if (pageList.length === 30) isGetting = false;
		}
	}

	$effect(() => {
		items = [...fileNameList];
		page = 2;
		isGetting = false;
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});
</script>

<div
	class="flex flex-wrap gap-3 overflow-x-hidden overflo-y-visible py-3"
>
	{#each items as file (file.name)}
		<button
			class="relative grow h-64 max-w-lg cursor-pointer rounded-lg overflow-hidden bg-primary-content hover:scale-105 transition-all"
			onclick={() => onClickItem(file)}
			type="button"
		>
			{#if file.isDeletable}
				<DeleteButton
					fileName={file.name}
					onDeleted={() => removeItem(file.name)}
				/>
			{/if}
			<CopyButton fileName={file.name} />
			<img
				src={`/images/${file.name}`}
				alt="LGTM"
				class="h-full w-full object-cover"
				width="960"
				height="960"
			/>
		</button>
	{/each}
</div>
<dialog bind:this={dialog} class="modal">
	<div class="modal-box w-auto">
		<div class="relative group/item">
			{#if diaImage}
				{#if diaImage.isDeletable}
					<DeleteButton
						fileName={diaImage.name}
						isVisible={false}
						onDeleted={() => {
							if (diaImage) removeItem(diaImage.name);
							closeDialog();
						}}
					/>
				{/if}
				<CopyButton
					fileName={diaImage.name}
					onClick={closeDialog}
					isVisible={false}
				/>
				<img src={`/images/${diaImage.name}`} alt="LGTM" width="960" height="960" />
			{:else}
				<div class="skeleton h-full w-full"></div>
			{/if}
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="button" onclick={closeDialog}>close</button>
	</form>
</dialog>
