"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import DomainManager from "@/components/domain-manager"
import DashboardLayout from "@/components/dashboard-layout"

export default function DomainsPage() {
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
    <DashboardLayout activeTab="domains">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">域名管理</h1>
        <DomainManager />
      </div>
    </DashboardLayout>
  )
}

