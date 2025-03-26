import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DomainProvider } from "@/contexts/domain-context"
import { SiteProvider } from "@/contexts/site-context"
import { MainNav } from "@/components/main-nav"
import { SiteMetadata } from "@/components/site-metadata"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
            </SiteProvider>
          </DomainProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
