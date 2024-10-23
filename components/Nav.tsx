import { Disclosure } from "@headlessui/react";
import Link from "next/link";

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}
export default async function Nav() {
	const navigation: {
		name: string;
		href: string;
		current: boolean;
	}[] = [
		{ name: "Webhook", href: "/", current: false },
		{ name: "Test", href: "/test", current: false },
	];
	return (
		<Disclosure as="nav" className="bg-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<div className="flex-shrink-0 text-white">𝕏ool</div>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										aria-current={item.current ? "page" : undefined}
										className={classNames(
											item.current
												? "bg-gray-900 text-white"
												: "text-gray-300 hover:bg-gray-700 hover:text-white",
											"rounded-md px-3 py-2 text-sm font-medium",
										)}
									>
										{item.name}
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Mobile menu, show/hide based on menu state. */}
			<div className="md:hidden" id="mobile-menu">
				<div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							aria-current={item.current ? "page" : undefined}
							className={classNames(
								item.current
									? "bg-gray-900 text-white"
									: "text-gray-300 hover:bg-gray-700 hover:text-white",
								"block rounded-md px-3 py-2 text-base font-medium",
							)}
						>
							{item.name}
						</Link>
					))}
				</div>
			</div>
		</Disclosure>
	);
}
