"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
	const pathname = usePathname();
	return (
		<>
			<li>
				<Link href="/" className={pathname === "/" ? "active" : ""}>
					Webhook
				</Link>
			</li>
			<li>
				<Link href="/test" className={pathname === "/test" ? "active" : ""}>
					Test
				</Link>
			</li>
		</>
	);
}
