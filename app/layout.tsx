import type { Metadata } from "next";
import { BIZ_UDPGothic, BIZ_UDPMincho } from "next/font/google";
import "./globals.css";
import Link from "next/link";
export const metadata: Metadata = {
	title: "𝕏ool",
	description: "Tool for 𝕏",
};
const gothic = BIZ_UDPGothic({
	weight: ["400", "700"],
	subsets: ["cyrillic"],
	variable: "--font-gothic",
});
const mincho = BIZ_UDPMincho({
	weight: ["400", "700"],
	subsets: ["cyrillic"],
	variable: "--font-mincho",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="ja"
			className={`${gothic.variable} ${mincho.variable} dark:bg-gray-900`}
		>
			<body>
				<div className="min-h-full">
					<nav className="bg-gray-800">
						<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
							<div className="flex h-16 items-center justify-between">
								<div className="flex items-center">
									<div className="flex-shrink-0 text-white">𝕏ool</div>
									<div className="hidden md:block">
										<div className="ml-10 flex items-baseline space-x-4">
											{/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
											<Link
												href="/"
												className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
												aria-current="page"
											>
												Webhook
											</Link>
											<Link
												href="/test"
												className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
											>
												Test
											</Link>
										</div>
									</div>
								</div>
								<div className="-mr-2 flex md:hidden">
									{/* Mobile menu button */}
									<button
										type="button"
										className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
										aria-controls="mobile-menu"
										aria-expanded="false"
									>
										<span className="absolute -inset-0.5" />
										<span className="sr-only">Open main menu</span>
										{/* Menu open: "hidden", Menu closed: "block" */}
										<svg
											className="block h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
											/>
										</svg>
										{/* Menu open: "block", Menu closed: "hidden" */}
										<svg
											className="hidden h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
						{/* Mobile menu, show/hide based on menu state. */}
						<div className="md:hidden" id="mobile-menu">
							<div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
								{/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
								<Link
									href="/"
									className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
									aria-current="page"
								>
									Webhook
								</Link>
								<Link
									href="/test"
									className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
								>
									Test
								</Link>
							</div>
						</div>
					</nav>
					<header className="shadow">
						<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
							<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
								𝕏ool Webhook
							</h1>
						</div>
					</header>
					<main>
						<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
							{children}
						</div>
					</main>
				</div>
			</body>
		</html>
	);
}
