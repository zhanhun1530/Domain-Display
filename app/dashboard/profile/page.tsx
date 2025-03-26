"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import UserProfile from "@/components/user-profile"
import DashboardLayout from "@/components/dashboard-layout"
import PasswordManager from "@/components/password-manager"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!user?.isAdmin) {
      router.push("/login")
    }
  }, [user, router])

  // 如果用户未登录，不渲染内容
  if (!user?.isAdmin) {
    return null
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">个人资料</h1>
        <PasswordManager />
      </div>
    </DashboardLayout>
  )
}

