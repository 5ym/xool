import { autoAction } from "@/components/client";
import { cookies } from "next/headers";
import { Suspense } from "react";
import "highlight.js/styles/github-dark.css";
import CodeBlock from "@/components/CodeBlock";

export default function Home() {
  const cookieStore = cookies();
  const wkey = cookieStore.get("key")?.value;
  const message = cookieStore.get("message")?.value;
  return (
    <main className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-12">
      <h2 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        𝕏ool Webhook
      </h2>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
        Webhookでポストをできるようにします
      </p>
      {message !== undefined ? (
        <div
          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">{message}</span>
        </div>
      ) : (
        wkey !== undefined && (
          <Suspense
            fallback={
              <div className="mb-4 px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">
                loading...
              </div>
            }
          >
            <KeyInfo wkey={wkey} />
          </Suspense>
        )
      )}
      <a
        href="/api/oauth"
        className="text-white bg-black hover:bg-[#222]/90 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center dark:focus:ring-[#1da1f2]/55 mb-6 inline-block"
      >
        <span>Sign in with</span>
        <span className="text-2xl ml-2 leading-6 align-text-bottom">𝕏</span>
      </a>
      <h3 className="text-4xl font-extrabold dark:text-white">プライバシー</h3>
      <p className="mb-3 text-gray-500 dark:text-gray-400">
        Webhookを作成するにあたってUser ID, Access Token, Refresh
        Tokenのみをサーバに保存しております。
        <br />
        そのほかのユーザー情報の取得は一切行っておりませんので、ご安心ください。
      </p>
      <p className="mb-3 text-gray-500 dark:text-gray-400">
        不具合などの報告は
        <a
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          target="_blank"
          href="https://x.com/5yuim"
        >
          @5yuim
        </a>
        へ
      </p>
      <a
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        target="_blank"
        href="https://g.doany.io/5ym/tweel"
      >
        ソースコード
      </a>
    </main>
  );
}

async function KeyInfo(props: { wkey: string }) {
  const ret = await autoAction("me", props.wkey);
  const keyError = ret?.error;
  return (
    <>
      {keyError ? (
        <div
          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">{keyError}</span>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold dark:text-white mb-1">
            curlサンプル
          </h3>
          <CodeBlock
            language="sh"
            code={`curl \\\n\t--location 'https://${process.env.HOST}/api/tweets' \\\n\t--header 'Content-Type: application/json' \\\n\t--data '{"key": "${props.wkey}","text": "example"}'`}
          />
          <h3 className="text-2xl font-bold dark:text-white mb-1">
            現在のアカウント
          </h3>
          {ret?.status === 429 ? (
            <div
              className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
              role="alert"
            >
              <span className="font-medium">
                ユーザー情報取得APIが上限に達しました
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mb-4">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Username
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">{ret?.data.id}</td>
                    <td className="px-6 py-4">{ret?.data.name}</td>
                    <td className="px-6 py-4">{ret?.data.username}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <h3 className="mb-1 text-2xl font-bold dark:text-white">
            別のアカウントを使用する場合は
            <a
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              target="_blank"
              href="https://x.com"
            >
              𝕏
            </a>
            側でアカウントを切り替えてから下記で再ログイン
          </h3>
        </>
      )}
    </>
  );
}
