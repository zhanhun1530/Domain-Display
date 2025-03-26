import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: "profile" | "domains" | "backup" | "settings"
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">管理控制台</h1>

      <div className="mb-8 border-b">
        <div className="flex space-x-1 flex-wrap">
          <Button variant={activeTab === "profile" ? "default" : "ghost"} asChild className="rounded-none rounded-t-lg">
            <Link href="/dashboard/profile">用户资料</Link>
          </Button>
          <Button variant={activeTab === "domains" ? "default" : "ghost"} asChild className="rounded-none rounded-t-lg">
            <Link href="/dashboard/domains">域名管理</Link>
          </Button>
          <Button variant={activeTab === "backup" ? "default" : "ghost"} asChild className="rounded-none rounded-t-lg">
            <Link href="/dashboard/backup">备份管理</Link>
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            asChild
            className="rounded-none rounded-t-lg"
          >
            <Link href="/dashboard/settings">网站设置</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}

