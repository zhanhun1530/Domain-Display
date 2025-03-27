"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import SiteSettings from "@/components/site-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // 设置一个短暂的延迟，确保组件能够正确加载
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isLoggedIn, router])

  // 错误处理函数
  const handleError = (err: Error) => {
    console.error("设置页面加载错误:", err)
    setError("加载设置页面时发生错误，请刷新页面重试。")
    setIsLoading(false)
  }

  // 如果用户未登录，不渲染内容
  if (!isLoggedIn) {
    return null
  }

  // 显示加载状态
  if (isLoading) {
    return (
      <DashboardLayout activeTab="settings">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">正在加载设置...</p>
        </div>
      </DashboardLayout>
    )
  }

  // 显示错误信息
  if (error) {
    return (
      <DashboardLayout activeTab="settings">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          刷新页面
        </button>
      </DashboardLayout>
    )
  }

  // 正常渲染设置页面
  return (
    <DashboardLayout activeTab="settings">
      <h1 className="text-3xl font-bold mb-6">网站设置</h1>
      <div className="settings-container">
        <SiteSettings />
      </div>
    </DashboardLayout>
  )
}

