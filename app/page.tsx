import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import CodeBlock from "@/app/ui/CodeBlock";
import { autoAction } from "@/utils/client";

export default async function Page() {
	const cookieStore = await cookies();
	const wkey = cookieStore.get("key")?.value;
	const message = cookieStore.get("message")?.value;
	return (
		<div className="mx-auto p-4 prose">
			<p>Webhookで𝕏にポストをできるようにするウェブアプリケーションです</p>
			{message !== undefined ? (
				<div role="alert" className="alert alert-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<title>Danger</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{message}</span>
				</div>
			) : (
				wkey !== undefined && (
					<Suspense
						fallback={
							<>
								<div className="skeleton h-8 w-full mt-8 mb-3" />
								<div className="skeleton h-24 w-full mb-4" />
								<div className="skeleton h-8 w-full mt-8 mb-3" />
								<div className="skeleton h-24 w-full mt-7 mb-7" />
								<div className="skeleton h-8 w-full mt-8 mb-3" />
							</>
						}
					>
						<KeyInfo wkey={wkey} />
					</Suspense>
				)
			)}
			<Link href="/api/oauth" className="text-white bg-black btn">
				<span>Sign in with</span>
				<span className="text-2xl">𝕏</span>
			</Link>
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
					className="link link-primary"
					target="_blank"
					href="https://x.com/5yuim"
					rel="noreferrer"
				>
					@5yuim
				</a>
				へ
			</p>
			<a
				className="link link-primary"
				target="_blank"
				href="https://g.doany.io/5ym/tweel"
				rel="noreferrer"
			>
				ソースコード
			</a>
		</div>
	);
}

async function KeyInfo(props: { wkey: string }) {
	const ret = await autoAction("me", props.wkey);
	const keyError = ret?.error;
	return (
		<>
			{keyError ? (
				<div role="alert" className="alert alert-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<title>Danger</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{keyError}</span>
				</div>
			) : (
				<>
					<h3>curlサンプル</h3>
					<CodeBlock
						lang="sh"
						code={`curl \\\n\t--location 'https://${process.env.HOST}/api/tweets' \\\n\t--header 'Content-Type: application/json' \\\n\t--data '{"key": "${props.wkey}","text": "example"}'`}
					/>
					<h3>現在のアカウント</h3>
					{ret?.status === 429 ? (
						<div role="alert" className="alert alert-warning">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
							>
								<title>Warning</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<span>ユーザー情報取得APIが上限に達しました</span>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="table my-0">
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
					)}
					<h3>
						別のアカウントを使用する場合は下記で認証画面内でアカウント選択できます
					</h3>
				</>
			)}
		</>
	);
}
