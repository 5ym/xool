import { default as typographyPlugin } from "@tailwindcss/typography";
import daisyui from "daisyui";
import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["BIZ UDPGothic", "var(--font-gothic)"],
				serif: ["BIZ UDPMincho", "var(--font-mincho)"],
				mono: ["MesloLGS NF"],
			},
		},
	},
	plugins: [typographyPlugin, daisyui],
};
export default config;
