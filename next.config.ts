import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	outputFileTracingIncludes: {
		"/lgtm": [
			"./node_modules/@img/sharp-libvips-linux-x64/**/*",
			"./node_modules/@img/sharp-libvips-linuxmusl-x64/**/*",
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "100mb",
		},
	},
	images: {
		dangerouslyAllowLocalIP: true,
		remotePatterns: [new URL("http://xool-web/images/**")],
	},
};

export default nextConfig;
