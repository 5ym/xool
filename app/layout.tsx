import type { Metadata } from "next";
import { BIZ_UDPGothic, BIZ_UDPMincho } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
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
		<html lang="ja" className={`${gothic.variable} ${mincho.variable}`}>
			<body>
				<nav className="navbar">
					<div className="flex-1">
						<Link className="btn btn-ghost text-xl" href="/">
							𝕏ool
						</Link>
					</div>
					<div className="flex-none">
						<ul className="menu menu-horizontal px-1">
							<Nav />
						</ul>
					</div>
				</nav>
				<main>{children}</main>
			</body>
		</html>
	);
}
