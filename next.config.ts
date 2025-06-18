import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: "100mb",
		},
	},
	images: {
		remotePatterns: [new URL("http://xool-web/images/**")],
	},
};

export default nextConfig;
