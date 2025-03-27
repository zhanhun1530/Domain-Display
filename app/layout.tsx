import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DomainProvider } from "@/contexts/domain-context"
import { SiteProvider } from "@/contexts/site-context"
import { MainNav } from "@/components/main-nav"
import { SiteMetadata } from "@/components/site-metadata"
import { Toaster } from "@/components/ui/toaster"
import { initDb } from "@/lib/db-init"

// 初始化数据库
if (typeof process !== 'undefined') {
  initDb().catch(error => {
    console.error("数据库初始化失败:", error)
  })
}

const inter = Inter({ subsets: ["latin"] })

// 默认设置
const DEFAULT_SETTINGS = {
  siteName: "域名展示",
  logoType: "text",
  logoText: "域名展示",
  favicon: "https://xn--1xa.team/img/favicon.ico",
  registrarIcons: {}
}

// 确保localStorage初始化
if (typeof window !== 'undefined') {
  try {
    const storedSettings = localStorage.getItem("domain-display-site-settings")
    if (!storedSettings) {
      localStorage.setItem("domain-display-site-settings", JSON.stringify(DEFAULT_SETTINGS))
      console.log("初始化默认设置到localStorage")
    }
  } catch (error) {
    console.error("初始化localStorage失败:", error)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        {/* 添加一个默认的favicon，稍后会被SiteMetadata组件更新 */}
        <link rel="icon" href="/favicon.ico" />
        <title>域名展示</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DomainProvider>
            <SiteProvider>
              <SiteMetadata />
              <div className="flex flex-col min-h-screen">
                <MainNav />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </SiteProvider>
          </DomainProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
