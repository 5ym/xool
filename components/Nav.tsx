"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Nav() {
	const pathname = usePathname();
	return (
		<nav className="navbar">
			<div className="flex-1">
				<Link className="btn btn-ghost text-xl" href="/">
					𝕏ool
				</Link>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li>
						<Link href="/" className={pathname === "/" ? "active" : ""}>Webhook</Link>
					</li>
					<li>
						<Link href="/test" className={pathname === "/test" ? "active" : ""}>Test</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}
