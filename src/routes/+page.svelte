<script lang="ts">
import CodeBlock from "$lib/components/CodeBlock.svelte";
import ErrorAlert from "$lib/components/ErrorAlert.svelte";
import SignInButton from "$lib/components/SignInButton.svelte";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();
</script>

<div class="mx-auto p-4 prose">
	<p>Webhookで𝕏にポストをできるようにするウェブアプリケーションです</p>
	{#if data.message !== undefined}
		<ErrorAlert>{data.message}</ErrorAlert>
	{:else if data.wkey !== undefined && data.keyInfo}
		{#await data.keyInfo}
			<div class="skeleton h-8 w-full mt-8 mb-3"></div>
			<div class="skeleton h-24 w-full mb-4"></div>
			<div class="skeleton h-8 w-full mt-8 mb-3"></div>
			<div class="skeleton h-24 w-full mt-7 mb-7"></div>
			<div class="skeleton h-8 w-full mt-8 mb-3"></div>
		{:then ret}
			{#if ret?.error}
				<ErrorAlert>{ret.error}</ErrorAlert>
			{:else}
				<h3>curlサンプル</h3>
				<CodeBlock html={data.curlHtml ?? ""} />
				<h3>現在のアカウント</h3>
				{#if ret?.status === 429}
					<div role="alert" class="alert alert-warning">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<title>Warning</title>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<span>ユーザー情報取得APIが上限に達しました</span>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table my-0">
							<thead>
								<tr>
									<th scope="col">ID</th>
									<th scope="col">Name</th>
									<th scope="col">Username</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{ret?.data?.id}</td>
									<td>{ret?.data?.name}</td>
									<td>{ret?.data?.username}</td>
								</tr>
							</tbody>
						</table>
					</div>
				{/if}
				<h3>
					別のアカウントを使用する場合は下記で認証画面内でアカウント選択できます
				</h3>
			{/if}
		{/await}
	{/if}
	<SignInButton />
	<h3>プライバシー</h3>
	<p>
		Webhookを作成するにあたってUser ID, Access Token, Refresh
		Tokenのみをサーバに保存しております。
		<br />
		そのほかのユーザー情報の取得は一切行っておりませんので、ご安心ください。
	</p>
	<p>
		不具合などの報告は
		<a
			class="link link-primary"
			target="_blank"
			href="https://x.com/5yuim"
			rel="noreferrer"
		>
			@5yuim
		</a>
		へ
	</p>
	<a
		class="link link-primary"
		target="_blank"
		href="https://github.com/DAnything/xool"
		rel="noreferrer"
	>
		ソースコード
	</a>
</div>
