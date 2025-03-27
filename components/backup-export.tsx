"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, CheckCircle2, Save, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { saveData } from "@/lib/data-service"
import { useDomainContext } from "@/contexts/domain-context"
import { useToast } from "@/components/ui/use-toast"

// 备份数据类型
interface BackupData {
  version: string
  timestamp: number
  domains: any[]
  soldDomains: any[]
  friendlyLinks: any[]
}

export function BackupExport() {
  const { domains, soldDomains, friendlyLinks, isLoading } = useDomainContext()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [saveProgress, setSaveProgress] = useState(0)

  // 当前备份版本
  const BACKUP_VERSION = "1.0.0"

  // 创建备份
  const createBackup = (): BackupData => {
    return {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      domains,
      soldDomains,
      friendlyLinks
    }
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
      a.download = `domain-backup-${formattedDate}.json`

      // 触发下载
      document.body.appendChild(a)
      a.click()

      // 延迟清理，确保下载已开始
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // 完成进度
        clearInterval(interval)
        setExportProgress(100)

        setTimeout(() => {
          setIsExporting(false)
          
          toast({
            title: "备份成功",
            description: "数据已成功导出为JSON文件",
          })
        }, 500)
      }, 500)
    } catch (error) {
      console.error("导出备份失败:", error)
      setIsExporting(false)
      
      toast({
        variant: "destructive",
        title: "备份失败",
        description: "导出备份时发生错误",
      })
    }
  }

  // 保存备份到服务器
  const saveBackupToServer = async () => {
    if (isSaving || isLoading) return

    setIsSaving(true)
    setSaveProgress(0)

    // 模拟进度
    const interval = setInterval(() => {
      setSaveProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 50)

    try {
      // 创建备份数据
      const backup = createBackup()

      // 保存到服务器，使用当前日期作为文件名
      const date = new Date()
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
      const filename = `backup-${formattedDate}.json`
      
      const success = await saveData(filename, backup)
      
      clearInterval(interval)
      setSaveProgress(100)
      
      setTimeout(() => {
        setIsSaving(false)
        
        if (success) {
          toast({
            title: "持久化成功",
            description: `备份已保存到服务器: ${filename}`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "持久化失败",
            description: "保存备份到服务器时发生错误",
          })
        }
      }, 500)
    } catch (error) {
      console.error("保存备份到服务器失败:", error)
      clearInterval(interval)
      setIsSaving(false)
      
      toast({
        variant: "destructive",
        title: "持久化失败",
        description: "保存备份到服务器时发生意外错误",
      })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>备份数据</CardTitle>
        <CardDescription>将域名数据导出为JSON文件或保存到服务器</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">导出备份</span>
              </div>
              <Button 
                onClick={handleExport} 
                disabled={isExporting || isLoading}
                variant="outline"
                size="sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    导出中
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    导出JSON
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              下载所有域名数据的JSON文件备份
            </p>
            
            {isExporting && (
              <div className="mt-2">
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {exportProgress < 100 ? "正在准备下载..." : "下载已完成"}
                </p>
              </div>
            )}
          </div>
          
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Save className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">持久化备份</span>
              </div>
              <Button 
                onClick={saveBackupToServer} 
                disabled={isSaving || isLoading}
                variant="outline"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存到服务器
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              将备份持久化保存到服务器，以便于管理和恢复
            </p>
            
            {isSaving && (
              <div className="mt-2">
                <Progress value={saveProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {saveProgress < 100 ? "正在保存到服务器..." : "保存已完成"}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 flex justify-between text-xs text-muted-foreground">
        <span>当前数据：{domains.length}个待售域名，{soldDomains.length}个已售域名，{friendlyLinks.length}个友情链接</span>
        <span>备份版本：{BACKUP_VERSION}</span>
      </CardFooter>
    </Card>
  )
}