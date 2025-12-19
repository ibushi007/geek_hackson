import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-app",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Studyplus - エンジニアの成長を可視化",
  description:
    "GitHubと連携して、あなたの学習を自動記録。AIコーチがあなたの成長を見守ります。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}
