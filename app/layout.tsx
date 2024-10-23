import type { Metadata } from "next";
import { BIZ_UDPGothic, BIZ_UDPMincho } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
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
					<Nav />
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
