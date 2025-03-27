"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileJson,
  Database,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 备份数据类型
interface BackupData {
  version: string
  timestamp: number
  auth: {
    password: string
  }
  domains: any[]
  soldDomains: any[]
  friendlyLinks: any[]
  siteSettings?: any
}

// 当前备份版本
const BACKUP_VERSION = "1.1.0"

export default function BackupManager() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [backupStats, setBackupStats] = useState<{
    lastBackup: string | null
    domainsCount: number
    soldDomainsCount: number
    friendlyLinksCount: number
  }>({
    lastBackup: null,
    domainsCount: 0,
    soldDomainsCount: 0,
    friendlyLinksCount: 0,
  })
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

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

  // 加载备份统计信息
  useEffect(() => {
    loadBackupStats()
  }, [])

  // 加载备份统计信息
  const loadBackupStats = () => {
    try {
      // 获取上次备份时间
      const lastBackupStr = localStorage.getItem("domain-display-last-backup")
      const lastBackup = lastBackupStr ? new Date(Number.parseInt(lastBackupStr)).toLocaleString() : null

      // 获取域名数量
      const domainsStr = localStorage.getItem("domain-display-domains")
      const domains = domainsStr ? JSON.parse(domainsStr) : []

      // 获取已售域名数量
      const soldDomainsStr = localStorage.getItem("domain-display-sold-domains")
      const soldDomains = soldDomainsStr ? JSON.parse(soldDomainsStr) : []

      // 获取友情链接数量
      const friendlyLinksStr = localStorage.getItem("domain-display-friendly-links")
      const friendlyLinks = friendlyLinksStr ? JSON.parse(friendlyLinksStr) : []

      setBackupStats({
        lastBackup,
        domainsCount: domains.length,
        soldDomainsCount: soldDomains.length,
        friendlyLinksCount: friendlyLinks.length,
      })
    } catch (error) {
      console.error("加载备份统计信息失败:", error)
    }
  }

  // 创建备份
  const createBackup = (): BackupData => {
    // 从localStorage获取数据
    let auth = { password: "admin123" }
    let domains = []
    let soldDomains = []
    let friendlyLinks = []
    let siteSettings = null

    try {
      // 安全地获取数据
      const authStr = localStorage.getItem("domain-display-auth")
      const domainsStr = localStorage.getItem("domain-display-domains")
      const soldDomainsStr = localStorage.getItem("domain-display-sold-domains")
      const friendlyLinksStr = localStorage.getItem("domain-display-friendly-links")
      const siteSettingsStr = localStorage.getItem("domain-display-site-settings")

      if (authStr) auth = JSON.parse(authStr)
      if (domainsStr) domains = JSON.parse(domainsStr)
      if (soldDomainsStr) soldDomains = JSON.parse(soldDomainsStr)
      if (friendlyLinksStr) friendlyLinks = JSON.parse(friendlyLinksStr)
      if (siteSettingsStr) siteSettings = JSON.parse(siteSettingsStr)
    } catch (error) {
      console.error("读取数据失败:", error)
    }

    // 创建备份对象
    return {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      auth: {
        password: auth.password || "admin123",
      },
      domains,
      soldDomains,
      friendlyLinks,
      siteSettings,
    }
  }

  // 验证备份数据
  const validateBackup = (data: any): boolean => {
    // 检查基本结构
    if (!data || typeof data !== "object") return false
    if (!data.version || !data.timestamp) return false

    // 检查认证数据
    if (!data.auth || typeof data.auth !== "object") return false
    if (typeof data.auth.password !== "string") return false

    // 检查域名数据
    if (!Array.isArray(data.domains)) return false
    if (!Array.isArray(data.soldDomains)) return false
    if (!Array.isArray(data.friendlyLinks)) return false

    return true
  }

  // 处理导出备份
  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportProgress(0)

      // 模拟进度
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 50)

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

        // 保存最后备份时间
        localStorage.setItem("domain-display-last-backup", Date.now().toString())

        // 更新统计信息
        loadBackupStats()

        // 完成进度
        clearInterval(interval)
        setExportProgress(100)

        setTimeout(() => {
          setIsExporting(false)
          setMessage({ type: "success", text: "备份已成功导出" })

          // 3秒后清除消息
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }

          timeoutRef.current = setTimeout(() => {
            setMessage(null)
          }, 3000)
        }, 500)
      }, 500)
    } catch (error) {
      console.error("导出备份失败:", error)
      setIsExporting(false)
      setMessage({ type: "error", text: "导出备份失败" })
    }
  }

  // 导入备份
  const importBackup = async (backupJson: string): Promise<boolean> => {
    if (!backupJson || typeof backupJson !== "string") {
      return false
    }

    try {
      setImportProgress(0)

      // 模拟进度
      const interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 50)

      // 解析JSON
      const backup = JSON.parse(backupJson)

      // 验证备份数据
      if (!validateBackup(backup)) {
        clearInterval(interval)
        return false
      }

      // 保存认证数据
      let currentAuth = { isLoggedIn: false, password: "admin123" }
      try {
        const authStr = localStorage.getItem("domain-display-auth")
        if (authStr) {
          currentAuth = JSON.parse(authStr)
        }
      } catch (e) {
        console.error("读取认证数据失败:", e)
      }

      // 保存所有数据
      const updatedAuth = {
        ...currentAuth,
        password: backup.auth.password,
      }

      localStorage.setItem("domain-display-auth", JSON.stringify(updatedAuth))
      localStorage.setItem("domain-display-domains", JSON.stringify(backup.domains))
      localStorage.setItem("domain-display-sold-domains", JSON.stringify(backup.soldDomains))
      localStorage.setItem("domain-display-friendly-links", JSON.stringify(backup.friendlyLinks))

      // 如果有站点设置，也保存它
      if (backup.siteSettings) {
        localStorage.setItem("domain-display-site-settings", JSON.stringify(backup.siteSettings))
      }

      // 保存最后备份时间
      localStorage.setItem("domain-display-last-backup", Date.now().toString())

      // 更新统计信息
      loadBackupStats()

      // 完成进度
      clearInterval(interval)
      setImportProgress(100)

      // 延迟返回结果
      await new Promise((resolve) => setTimeout(resolve, 500))

      return true
    } catch (error) {
      console.error("导入备份失败:", error)
      return false
    }
  }

  // 处理导入备份
  const handleImport = async () => {
    if (!importFile) return

    setIsImporting(true)
    setShowImportConfirm(false)

    try {
      // 读取文件内容
      const content = await importFile.text()

      if (!content) {
        setMessage({ type: "error", text: "读取文件失败：文件内容为空" })
        setIsImporting(false)
        return
      }

      const success = await importBackup(content)

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
        setIsImporting(false)
      }
    } catch (error) {
      setMessage({ type: "error", text: "导入备份失败：文件格式错误" })
      setIsImporting(false)
    }
  }

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setMessage({ type: "error", text: "请选择有效的JSON备份文件" })
      return
    }

    setImportFile(file)
    setShowImportConfirm(true)

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

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">本地备份恢复</h1>

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

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">备份概览</TabsTrigger>
          <TabsTrigger value="actions">备份操作</TabsTrigger>
        </TabsList>

        {/* 备份概览 */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>备份概览</CardTitle>
              <CardDescription>查看您的数据备份状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-2xl font-bold">{backupStats.domainsCount}</h3>
                      <p className="text-sm text-muted-foreground">待售域名</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="text-2xl font-bold">{backupStats.soldDomainsCount}</h3>
                      <p className="text-sm text-muted-foreground">已售域名</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <ExternalLink className="h-8 w-8 text-blue-500 mb-2" />
                      <h3 className="text-2xl font-bold">{backupStats.friendlyLinksCount}</h3>
                      <p className="text-sm text-muted-foreground">友情链接</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>备份状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">上次备份时间</span>
                      <span className="text-sm text-muted-foreground">{backupStats.lastBackup || "从未备份"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">备份版本</span>
                      <span className="text-sm text-muted-foreground">v{BACKUP_VERSION}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">总数据项</span>
                      <span className="text-sm text-muted-foreground">
                        {backupStats.domainsCount + backupStats.soldDomainsCount + backupStats.friendlyLinksCount} 项
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter>
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                立即备份
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 备份操作 */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>备份操作</CardTitle>
              <CardDescription>导出或导入您的数据备份</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <FileJson className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-lg">导出备份</CardTitle>
                    </div>
                    <CardDescription>将您的所有数据导出为JSON文件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>包含内容：</span>
                        <span className="text-muted-foreground">域名、设置、密码</span>
                      </div>
                      {isExporting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>导出进度</span>
                            <span>{exportProgress}%</span>
                          </div>
                          <Progress value={exportProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleExport} className="w-full" disabled={isExporting}>
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          导出中...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          导出备份
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-lg">导入备份</CardTitle>
                    </div>
                    <CardDescription>从之前导出的JSON文件中恢复您的数据</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>支持格式：</span>
                        <span className="text-muted-foreground">JSON 备份文件</span>
                      </div>
                      {isImporting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>导入进度</span>
                            <span>{importProgress}%</span>
                          </div>
                          <Progress value={importProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={triggerFileInput} className="w-full" disabled={isImporting}>
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          导入中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          选择备份文件
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".json,application/json"
                      className="hidden"
                    />
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-xs text-muted-foreground">
                备份文件包含您的所有数据，包括管理员密码。请妥善保管您的备份文件。
              </p>
              <p className="text-xs text-muted-foreground">
                导入备份将覆盖当前的所有数据，请确保您已经备份了当前数据。
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 导入确认对话框 */}
      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认导入备份</DialogTitle>
            <DialogDescription>导入备份将覆盖当前的所有数据，此操作无法撤销。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">文件信息</h4>
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>文件名：</span>
                  <span className="font-medium">{importFile?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span>大小：</span>
                  <span>{importFile ? formatFileSize(importFile.size) : "未知"}</span>
                </div>
              </div>
            </div>
            <Alert variant="destructive" className="bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>此操作将覆盖您当前的所有数据，包括域名、设置和密码。</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleImport}>
              <ArrowRight className="h-4 w-4 mr-2" />
              确认导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

