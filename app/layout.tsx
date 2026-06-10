import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloud tops - Minecraft Survival Server",
  description: "Cloud tops - A pure vanilla Minecraft survival community. Apply for whitelist to join!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link rel="icon" type="image/png" href="/images/%E8%8D%89%E6%96%B9%E5%9D%97.png" />
        {/* 直接写入 title，绕开 Next.js 把中文 metadata 写入 HTTP header 的 bug */}
        <title>Cloud tops 云顶之境 - Minecraft 原版生存服务器</title>
        <meta name="description" content="Cloud tops 云顶之境是一个纯原版 Minecraft 生存社区，公益服务器，欢迎申请白名单加入！" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
