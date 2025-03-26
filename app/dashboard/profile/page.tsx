"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import UserProfile from "@/components/user-profile"
import DashboardLayout from "@/components/dashboard-layout"

export default function ProfilePage() {
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
    <DashboardLayout activeTab="profile">
      <UserProfile />
    </DashboardLayout>
  )
}

