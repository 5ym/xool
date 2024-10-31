"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Nav() {
	const pathname = usePathname();
	const initList = [
		{ href: "/", title: "Webhook", current: false },
		{ href: "/test", title: "Test", current: false },
	];
	const [navList, setNavList] =
		useState<
			{
				href: string;
				title: string;
				current: boolean;
			}[]
		>();
	const setCurrent = useCallback(() => {
		const tmpList = initList;
		initList.forEach((element, index) => {
			if (element.href === pathname) {
				element.current = true;
				tmpList[index] = element;
				return;
			}
		});
		setNavList(tmpList);
	}, [pathname]);
	useEffect(() => {
		setCurrent();
	}, [setCurrent]);

	return (
		<nav className="navbar bg-base-100">
			<div className="navbar-start">
				<div className="dropdown">
					<button type={undefined} className="btn btn-ghost lg:hidden">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>hamburger</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h8m-8 6h16"
							/>
						</svg>
					</button>
					<ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
						{navList ? (
							navList.map(({ href, title, current }) => (
								<li key={href}>
									<Link href={href} className={current ? "active" : ""}>
										{title}
									</Link>
								</li>
							))
						) : (
							<div className="skeleton h-9 w-24" />
						)}
					</ul>
				</div>
				<Link href="/" className="btn btn-ghost text-xl">
					𝕏ool
				</Link>
			</div>
			<div className="navbar-center hidden lg:flex">
				<ul className="menu menu-horizontal px-1">
					{navList ? (
						navList.map(({ href, title, current }) => (
							<li key={href}>
								<Link href={href} className={current ? "active" : ""}>
									{title}
								</Link>
							</li>
						))
					) : (
						<div className="skeleton h-9 w-24" />
					)}
				</ul>
			</div>
			<div className="navbar-end" />
		</nav>
	);
}
