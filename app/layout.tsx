import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DomainProvider } from "@/contexts/domain-context"
import { MainNav } from "@/components/main-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "域名展示",
  description: "展示和管理您的域名集合",
  icons: {
    icon: [{ url: "https://xn--1xa.team/img/favicon.ico", type: "image/png" }],
    apple: [{ url: "https://xn--1xa.team/img/favicon.ico", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <AuthProvider>
          <DomainProvider>
            <div className="flex flex-col min-h-screen">
              <MainNav />
              <main className="flex-1">{children}</main>
            </div>
          </DomainProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'