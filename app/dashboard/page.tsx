"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserProfile from "@/components/user-profile"
import DomainManager from "@/components/domain-manager"
import BackupManager from "@/components/backup-manager"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("profile")
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!user?.isLoggedIn) {
      setRedirecting(true)
      router.push("/login")
    }

    // 从URL参数读取默认标签
    const tabParam = searchParams.get("tab")
    if (tabParam && ["profile", "domains", "backup"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [user, router, searchParams])

  // 如果正在重定向，显示加载状态
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">正在重定向...</p>
      </div>
    )
  }

  // 如果用户未登录且未重定向，显示加载状态
  if (!user?.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">正在检查登录状态...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">管理控制台</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">用户资料</TabsTrigger>
          <TabsTrigger value="domains">域名管理</TabsTrigger>
          <TabsTrigger value="backup">备份管理</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
        <TabsContent value="domains">
          <DomainManager />
        </TabsContent>
        <TabsContent value="backup">
          <BackupManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

