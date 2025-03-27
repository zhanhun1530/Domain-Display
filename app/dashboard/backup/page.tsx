"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DataBackup } from "@/components/data-backup"
import { BackupList } from "@/components/backup-list"
import { StaticBackup } from "@/components/static-backup"
import DatabaseBackup from "@/components/database-backup"
import DatabaseBackupList from "@/components/database-backup-list"
import DashboardLayout from "@/components/dashboard-layout"

export default function BackupPage() {
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
    <DashboardLayout activeTab="backup">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">数据备份管理</h2>
          <p className="text-muted-foreground mb-6">
            备份和管理所有系统数据，确保数据安全性，支持自动备份和手动备份恢复
          </p>
          
          <div className="mb-6">
            <DataBackup />
          </div>
          
          <div className="mb-6">
            <DatabaseBackup />
          </div>
          
          <div className="mb-6">
            <DatabaseBackupList />
          </div>
          
          <div className="mb-6">
            <StaticBackup />
          </div>
          
          <div className="mb-6">
            <BackupList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

