"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import SiteSettings from "@/components/site-settings"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!user?.isLoggedIn) {
      router.push("/login")
    }
  }, [user, router])

  // 如果用户未登录，不渲染内容
  if (!user?.isLoggedIn) {
    return null
  }

  return (
    <DashboardLayout activeTab="settings">
      <SiteSettings />
    </DashboardLayout>
  )
}

