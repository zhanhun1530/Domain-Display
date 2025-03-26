"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DomainManager from "@/components/domain-manager"
import DashboardLayout from "@/components/dashboard-layout"

export default function DomainsPage() {
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
    <DashboardLayout activeTab="domains">
      <DomainManager />
    </DashboardLayout>
  )
}

