"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import PasswordManager from "@/components/password-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Database, Cog } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  // 如果用户未登录，不渲染内容
  if (!isLoggedIn) {
    return null
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">控制台</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="域名管理"
            description="管理您的域名数据和展示信息"
            icon={<Globe className="h-5 w-5" />}
            href="/dashboard/domains"
          />
          <DashboardCard
            title="备份管理"
            description="导出或导入您的数据备份"
            icon={<Database className="h-5 w-5" />}
            href="/dashboard/backup"
          />
          <DashboardCard
            title="网站设置"
            description="自定义网站外观和功能"
            icon={<Cog className="h-5 w-5" />}
            href="/dashboard/settings"
          />
        </div>

        <div className="mt-8">
          <PasswordManager />
        </div>
      </div>
    </DashboardLayout>
  )
}

function DashboardCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={href}>
            进入管理
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

