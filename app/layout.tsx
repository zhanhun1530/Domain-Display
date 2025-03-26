import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DomainProvider } from "@/contexts/domain-context"
import { SiteProvider } from "@/contexts/site-context"
import { MainNav } from "@/components/main-nav"
import { SiteMetadata } from "@/components/site-metadata"

const inter = Inter({ subsets: ["latin"] })

// 从客户端动态获取的元数据应用在SSR阶段
export async function generateMetadata() {
  // 尝试从localStorage获取站点设置（仅在客户端可用）
  let siteName = "域名展示"; // 默认站点名称
  let favicon = "https://xn--1xa.team/img/favicon.ico"; // 默认favicon
  
  // 将根据客户端保存的设置在客户端侧进行更新
  return {
    title: siteName,
    icons: {
      icon: favicon,
      apple: favicon
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        {/* 元数据将在客户端运行时由SiteMetadata组件更新 */}
        <link rel="icon" href="https://xn--1xa.team/img/favicon.ico" />
        <link rel="apple-touch-icon" href="https://xn--1xa.team/img/favicon.ico" />
        <title>域名展示</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DomainProvider>
            <SiteProvider>
              {/* 放在body内部是安全的，确保元数据可以更新 */}
              <SiteMetadata />
              <div className="flex flex-col min-h-screen">
                <MainNav />
                <main className="flex-1">{children}</main>
              </div>
            </SiteProvider>
          </DomainProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
