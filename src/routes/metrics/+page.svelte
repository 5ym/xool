<script lang="ts">
import { invalidateAll } from "$app/navigation";
import ErrorAlert from "$lib/components/ErrorAlert.svelte";
import SignInButton from "$lib/components/SignInButton.svelte";
import Sparkline from "$lib/components/Sparkline.svelte";
import { setMessage } from "$lib/stores/toast.svelte";
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let isCapturing = $state(false);

const numberFormat = new Intl.NumberFormat("ja-JP");
const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", {
	dateStyle: "short",
	timeStyle: "short",
});

async function capture() {
	try {
		isCapturing = true;
		const res = await fetch("/api/metrics", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: data.wkey }),
		});
		const ret = await res.json();
		if (!res.ok || ret.error) throw new Error(ret.error ?? "capture failed");
		setMessage(`${ret.posts}件のポストを記録しました`);
	} catch {
		setMessage("記録に失敗しました");
	} finally {
		await invalidateAll();
		isCapturing = false;
	}
}
</script>

<div class="page-container p-4">
	<div class="prose">
		<p>
			自分のポストのインプレッションやプロフィールクリックを記録して、推移を見られるようにします
			<br />
			このページを開いたタイミングでその時点の数値を記録します（15分以内に記録済みの場合はスキップ）
			<br />
			𝕏は投稿から30日以内のポストしか非公開の数値を返さず遡っての取得もできないため、開かなかった期間の推移は残りません
		</p>
	</div>

	{#if !data.isLoggedIn}
		<div class="prose">
			<p>利用するにはログインしてください</p>
		</div>
		<SignInButton redirect="metrics" />
	{:else}
		{#if data.captureFailed}
			<ErrorAlert>数値の取得に失敗しました</ErrorAlert>
		{/if}

		<div class="flex items-center gap-3 my-6">
			<button
				type="button"
				class="btn btn-primary"
				disabled={isCapturing}
				onclick={capture}
			>
				{#if isCapturing}
					<span class="loading loading-spinner"></span>
				{/if}
				今すぐ記録
			</button>
			<span class="text-sm opacity-60">
				{data.tweets.length}件を追跡中
				{#if data.capturedAt !== undefined}
					・最終記録 {dateTimeFormat.format(data.capturedAt)}
				{/if}
			</span>
		</div>

		{#each data.tweets as tweet (tweet.tweetId)}
			{@const impressions = tweet.latest?.impressions ?? 0}
			<article class="card card-border bg-base-100 mb-4">
				<div class="card-body gap-3">
					<div>
						<p class="line-clamp-2 whitespace-pre-wrap">{tweet.text}</p>
						<a
							class="link link-primary text-xs"
							target="_blank"
							rel="noreferrer"
							href="https://x.com/i/status/{tweet.tweetId}"
						>
							{dateTimeFormat.format(tweet.postedAt)}
						</a>
					</div>

					<div class="flex items-end justify-between gap-4">
						<div>
							<div class="text-3xl leading-none">
								{numberFormat.format(impressions)}
							</div>
							<div class="text-sm opacity-60 mt-1">
								インプレッション
								{#if tweet.delta !== 0}
									<span
										class={tweet.delta > 0 ? "text-success" : "text-error"}
									>
										{tweet.delta > 0 ? "▲" : "▼"}{numberFormat.format(
											Math.abs(tweet.delta),
										)}
									</span>
								{/if}
							</div>
						</div>
						<Sparkline
							values={tweet.snapshots.map((s) => s.impressions)}
							label="インプレッションの推移"
						/>
					</div>

					<dl class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
						{#each [{ name: "プロフィールクリック", value: tweet.latest?.profileClicks }, { name: "リンククリック", value: tweet.latest?.linkClicks }, { name: "いいね", value: tweet.latest?.likes }, { name: "リポスト", value: tweet.latest?.reposts }, { name: "ブックマーク", value: tweet.latest?.bookmarks }] as metric (metric.name)}
							<div class="flex gap-2">
								<dt class="opacity-60">{metric.name}</dt>
								<dd class="tabular-nums">
									{numberFormat.format(metric.value ?? 0)}
								</dd>
							</div>
						{/each}
					</dl>

					{#if tweet.snapshots.length > 1}
						<details>
							<summary class="cursor-pointer text-sm opacity-60">
								スナップショット {tweet.snapshots.length}件
							</summary>
							<div class="overflow-x-auto mt-2">
								<table class="table table-sm tabular-nums">
									<thead>
										<tr>
											<th scope="col">記録日時</th>
											<th scope="col">インプレ</th>
											<th scope="col">プロフ</th>
											<th scope="col">リンク</th>
										</tr>
									</thead>
									<tbody>
										{#each tweet.snapshots.toReversed() as snapshot (snapshot.capturedAt)}
											<tr>
												<td>{dateTimeFormat.format(snapshot.capturedAt)}</td>
												<td>{numberFormat.format(snapshot.impressions)}</td>
												<td>{numberFormat.format(snapshot.profileClicks)}</td>
												<td>{numberFormat.format(snapshot.linkClicks)}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</details>
					{/if}
				</div>
			</article>
		{:else}
			<p class="opacity-60">
				まだ記録がありません。「今すぐ記録」で最初のスナップショットを撮ってください
			</p>
		{/each}
	{/if}
</div>
