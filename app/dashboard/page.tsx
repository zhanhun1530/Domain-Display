"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!user?.isLoggedIn) {
      router.push("/login")
    } else {
      // 如果用户已登录，重定向到用户资料页面
      router.push("/dashboard/profile")
    }
  }, [user, router])

  // 返回空内容，因为这个页面会立即重定向
  return null
}

