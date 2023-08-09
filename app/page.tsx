import { autoAction } from '@/utils/client';
import hljs from 'highlight.js'
import { cookies } from 'next/headers'
import { Suspense } from 'react';
import 'highlight.js/styles/github-dark.css';

export default function Home() {
  const cookieStore = cookies()
  const wkey = cookieStore.get('key')?.value
  const message = cookieStore.get('message')?.value
  return (
    <main className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-12'>
      <h2 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Tweel Webhook</h2>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Webhookでツイートをできるようにします</p>
      {message !== undefined ?
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">{message}</span>
        </div> :
        (wkey !== undefined &&
          <Suspense fallback={<div className="mb-4 px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>}>
            <KeyInfo wkey={wkey} />
          </Suspense>
        )
      }
      <a href='/api/oauth' className="text-white bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#1da1f2]/55 mb-6">
        <svg className="w-4 h-4 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"></path></svg>
        Sign in with Twitter
      </a>
      <h3 className="text-4xl font-extrabold dark:text-white">プライバシー</h3>
      <p className="mb-3 text-gray-500 dark:text-gray-400">Webhookを作成するにあたってUser ID, Access Token, Refresh Tokenのみをサーバに保存しております。<br />
      そのほかのユーザー情報の取得は一切行っておりませんので、ご安心ください。</p>
      <p className="mb-3 text-gray-500 dark:text-gray-400">不具合などの報告は<a className='font-medium text-blue-600 dark:text-blue-500 hover:underline' target="_blank" href='https://twitter.com/5yuim'>@5yuim</a>へ</p>
      <a className='font-medium text-blue-600 dark:text-blue-500 hover:underline' target="_blank" href='https://g.doany.io/5ym/tweel'>ソースコード</a>
    </main>
  )
}

async function KeyInfo(props: { wkey: string }) {
  const ret = await autoAction('me', props.wkey)
  const keyError = ret?.error
  return (<>
    {keyError ?
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span className="font-medium">{keyError}</span>
      </div> :
      <>
        <h3 className='text-2xl font-bold dark:text-white mb-1'>curlサンプル</h3>
        <CodeBlock language='sh' code={`curl \\\n\t--location 'https://${process.env.HOST}/api/tweets' \\\n\t--header 'Content-Type: application/json' \\\n\t--data '{"key": "${props.wkey}","text": "example"}'`} />
        <h3 className='text-2xl font-bold dark:text-white mb-1'>現在のアカウント</h3>
        {ret?.status === 429 ?
          <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
            <span className="font-medium">ユーザー情報取得APIが上限に達しました</span>
          </div> :
          <CodeBlock language='json' code={JSON.stringify(ret?.data)} /> }
        <h3 className='mb-1 text-2xl font-bold dark:text-white'>別のアカウントを使用する場合は<a className='font-medium text-blue-600 dark:text-blue-500 hover:underline' target="_blank" href='https://twitter.com'>twitter</a>側でアカウントを切り替えてから下記で再ログイン</h3>
      </>
    }
  </>)
}

function CodeBlock(props: { code: string, language: string }) {
  // コードから自動的に言語を識別してハイライトする
  const highlightedCode: string = hljs.highlight(props.code, {language: props.language}).value
  return (
      <pre className='mb-4 bg-gray-800 text-white'>
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
  )
}

