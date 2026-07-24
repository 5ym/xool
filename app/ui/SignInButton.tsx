import Link from "next/link";

export default function SignInButton({ redirect }: { redirect?: string }) {
	return (
		<Link
			href={redirect ? `/api/oauth?redirect=${redirect}` : "/api/oauth"}
			className="text-white bg-black btn"
		>
			<span>Sign in with</span>
			<span className="text-2xl">𝕏</span>
		</Link>
	);
}
