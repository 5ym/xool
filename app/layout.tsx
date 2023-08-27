import type { Metadata } from "next";
import { BIZ_UDPGothic } from "next/font/google";
import "./globals.css";
export const metadata: Metadata = {
  title: "Tweel",
  description: "Tool for Twitter",
};
const UD = BIZ_UDPGothic({
  weight: ["400", "700"],
  subsets: ["cyrillic"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={UD.className + " dark:bg-gray-900"}>{children}</body>
    </html>
  );
}
