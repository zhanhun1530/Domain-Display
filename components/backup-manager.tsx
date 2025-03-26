"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"

// 备份数据类型
interface BackupData {
  version: string
  timestamp: number
  user: {
    username: string
    password: string
  }
  domains: any[]
  soldDomains: any[]
  friendlyLinks: any[]
}

// 当前备份版本
const BACKUP_VERSION = "1.0.0"

export default function BackupManager() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 用于存储定时器ID，以便在组件卸载时清除
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 组件卸载时清除所有定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  // 创建备份
  const createBackup = (): BackupData => {
    // 从localStorage获取数据
    let user = { username: "admin", password: "password" }
    let domains = []
    let soldDomains = []
    let friendlyLinks = []

    try {
      // 安全地获取数据
      const userStr = localStorage.getItem("domain-display-user")
      const domainsStr = localStorage.getItem("domain-display-domains")
      const soldDomainsStr = localStorage.getItem("domain-display-sold-domains")
      const friendlyLinksStr = localStorage.getItem("domain-display-friendly-links")

      if (userStr) user = JSON.parse(userStr)
      if (domainsStr) domains = JSON.parse(domainsStr)
      if (soldDomainsStr) soldDomains = JSON.parse(soldDomainsStr)
      if (friendlyLinksStr) friendlyLinks = JSON.parse(friendlyLinksStr)
    } catch (error) {
      console.error("读取数据失败:", error)
    }

    // 创建备份对象
    return {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      user: {
        username: user.username || "admin",
        password: user.password || "password",
      },
      domains,
      soldDomains,
      friendlyLinks,
    }
  }

  // 验证备份数据
  const validateBackup = (data: any): boolean => {
    // 检查基本结构
    if (!data || typeof data !== "object") return false
    if (!data.version || !data.timestamp) return false

    // 检查用户数据
    if (!data.user || typeof data.user !== "object") return false
    if (typeof data.user.username !== "string" || typeof data.user.password !== "string") return false

    // 检查域名数据
    if (!Array.isArray(data.domains)) return false
    if (!Array.isArray(data.soldDomains)) return false
    if (!Array.isArray(data.friendlyLinks)) return false

    return true
  }

  // 处理导出备份
  const handleExport = () => {
    try {
      // 创建备份数据
      const backup = createBackup()

      // 转换为JSON字符串
      const backupJson = JSON.stringify(backup, null, 2)

      // 创建Blob对象
      const blob = new Blob([backupJson], { type: "application/json" })

      // 创建下载链接
      const url = URL.createObjectURL(blob)

      // 使用更安全的方式创建和触发下载
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url

      // 设置文件名（使用当前日期）
      const date = new Date()
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
      a.download = `domain-display-backup-${formattedDate}.json`

      // 触发下载
      document.body.appendChild(a)
      a.click()

      // 延迟清理，确保下载已开始
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      setMessage({ type: "success", text: "备份已成功导出" })

      // 3秒后清除消息
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      console.error("导出备份失败:", error)
      setMessage({ type: "error", text: "导出备份失败" })
    }
  }

  // 导入备份
  const importBackup = (backupJson: string): boolean => {
    if (!backupJson || typeof backupJson !== "string") {
      return false
    }

    try {
      // 解析JSON
      const backup = JSON.parse(backupJson)

      // 验证备份数据
      if (!validateBackup(backup)) {
        return false
      }

      // 保存用户数据
      let currentUser = { isLoggedIn: false }
      try {
        const userStr = localStorage.getItem("domain-display-user")
        if (userStr) {
          currentUser = JSON.parse(userStr)
        }
      } catch (e) {
        console.error("读取用户数据失败:", e)
      }

      const updatedUser = {
        ...currentUser,
        username: backup.user.username,
        password: backup.user.password,
      }

      // 保存所有数据
      localStorage.setItem("domain-display-user", JSON.stringify(updatedUser))
      localStorage.setItem("domain-display-domains", JSON.stringify(backup.domains))
      localStorage.setItem("domain-display-sold-domains", JSON.stringify(backup.soldDomains))
      localStorage.setItem("domain-display-friendly-links", JSON.stringify(backup.friendlyLinks))

      return true
    } catch (error) {
      console.error("导入备份失败:", error)
      return false
    }
  }

  // 处理导入备份
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null)

    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setMessage({ type: "error", text: "请选择有效的JSON备份文件" })
      return
    }

    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content) {
          setMessage({ type: "error", text: "读取文件失败：文件内容为空" })
          return
        }

        const success = importBackup(content)

        if (success) {
          setMessage({ type: "success", text: "备份已成功导入，页面将在3秒后刷新" })

          // 3秒后刷新页面以应用导入的数据
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }

          timeoutRef.current = setTimeout(() => {
            window.location.href = window.location.href
          }, 3000)
        } else {
          setMessage({ type: "error", text: "导入备份失败：无效的备份文件" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "导入备份失败：文件格式错误" })
      }
    }

    reader.onerror = () => {
      setMessage({ type: "error", text: "读取文件失败" })
    }

    reader.readAsText(file)

    // 重置文件输入，以便可以选择同一个文件
    if (event.target) {
      event.target.value = ""
    }
  }

  // 触发文件选择对话框
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>备份管理</CardTitle>
        <CardDescription>导出或导入您的数据备份</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : undefined}
            className={message.type === "success" ? "bg-green-50 border-green-200" : undefined}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-600" : undefined}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">导出备份</h3>
            <p className="text-sm text-muted-foreground">将您的所有数据导出为JSON文件，包括用户凭据和域名数据。</p>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              导出备份
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">导入备份</h3>
            <p className="text-sm text-muted-foreground">从之前导出的JSON文件中恢复您的数据。</p>
            <Button onClick={triggerFileInput} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              导入备份
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json,application/json"
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          备份文件包含您的所有数据，包括用户名和密码。请妥善保管您的备份文件。
        </p>
      </CardFooter>
    </Card>
  )
}

