"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { 
  Save, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ClipboardList,
  Calendar
} from "lucide-react"
import { saveData, fetchData, listDataFiles } from "@/lib/data-service"
import { useDomainContext } from "@/contexts/domain-context"
import { useSite } from "@/contexts/site-context"

const BACKUP_VERSION = "1.0.0"
const AUTO_BACKUP_INTERVAL = 12 * 60 * 60 * 1000 // 12小时自动备份

export function DataBackup() {
  const { domains, soldDomains, friendlyLinks } = useDomainContext()
  const { settings } = useSite()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [backupCount, setBackupCount] = useState(0)
  
  // 当组件加载时检查上次备份时间
  useEffect(() => {
    checkLastBackup()
    loadBackupInfo()
    
    // 设置自动备份检查器
    const intervalId = setInterval(checkAutoBackup, 60 * 60 * 1000) // 每小时检查一次
    
    return () => clearInterval(intervalId)
  }, [])
  
  // 加载备份信息
  const loadBackupInfo = async () => {
    try {
      const files = await listDataFiles()
      const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      setBackupCount(backupFiles.length)
    } catch (error) {
      console.error("获取备份信息失败:", error)
    }
  }
  
  // 检查上次备份时间
  const checkLastBackup = () => {
    try {
      const lastBackup = localStorage.getItem("last-data-backup-time")
      if (lastBackup) {
        const date = new Date(parseInt(lastBackup))
        setLastBackupTime(date.toLocaleString())
      }
    } catch (error) {
      console.error("检查上次备份时间失败:", error)
    }
  }
  
  // 检查是否需要自动备份
  const checkAutoBackup = async () => {
    try {
      const lastBackup = localStorage.getItem("last-data-backup-time")
      if (!lastBackup) {
        // 从未备份过，执行第一次备份
        await createBackup(true)
        return
      }
      
      const lastBackupTime = parseInt(lastBackup)
      const now = Date.now()
      
      if (now - lastBackupTime > AUTO_BACKUP_INTERVAL) {
        // 已超过自动备份间隔，执行备份
        await createBackup(true)
      }
    } catch (error) {
      console.error("自动备份检查失败:", error)
    }
  }
  
  // 从localStorage获取密码
  const getPassword = (): string => {
    try {
      const authStr = localStorage.getItem("domain-display-auth")
      if (authStr) {
        const auth = JSON.parse(authStr)
        return auth.password || "admin123"
      }
    } catch (error) {
      console.error("获取密码失败:", error)
    }
    return "admin123"
  }
  
  // 创建备份数据对象
  const createBackupData = () => {
    const timestamp = Date.now()
    
    return {
      version: BACKUP_VERSION,
      timestamp,
      date: new Date(timestamp).toISOString(),
      auth: {
        password: getPassword()
      },
      domains,
      soldDomains,
      friendlyLinks,
      siteSettings: settings
    }
  }
  
  // 创建备份并保存到服务器
  const createBackup = async (isAuto = false) => {
    if (isSaving) return
    
    setIsSaving(true)
    setSaveProgress(0)
    
    // 模拟进度
    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 50)
    
    try {
      // 创建备份数据
      const backupData = createBackupData()
      
      // 生成文件名
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
      const filename = `backup-${dateStr}-${timeStr}.json`
      
      // 保存到服务器
      const success = await saveData(filename, backupData)
      
      clearInterval(interval)
      setSaveProgress(100)
      
      if (success) {
        // 记录最后备份时间
        localStorage.setItem("last-data-backup-time", Date.now().toString())
        setLastBackupTime(new Date().toLocaleString())
        
        // 更新备份计数
        loadBackupInfo()
        
        if (!isAuto) {
          toast({
            title: "备份成功",
            description: `已创建数据备份: ${filename}`,
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "备份失败",
          description: "保存数据到服务器时发生错误",
        })
      }
    } catch (error) {
      console.error("创建备份失败:", error)
      
      toast({
        variant: "destructive",
        title: "备份失败",
        description: "创建数据备份时发生意外错误",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // 下载备份数据
  const downloadBackup = () => {
    try {
      // 创建备份数据
      const backupData = createBackupData()
      
      // 转换为JSON字符串
      const backupJson = JSON.stringify(backupData, null, 2)
      
      // 创建Blob对象
      const blob = new Blob([backupJson], { type: "application/json" })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      
      // 生成文件名
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
      const filename = `all-data-backup-${dateStr}.json`
      
      // 创建并触发下载
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast({
          title: "下载成功",
          description: "完整数据备份已下载至您的设备",
        })
      }, 100)
    } catch (error) {
      console.error("下载备份失败:", error)
      
      toast({
        variant: "destructive",
        title: "下载失败",
        description: "准备下载备份时发生错误",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="h-5 w-5 mr-2 text-primary" />
          全站数据备份
        </CardTitle>
        <CardDescription>
          备份所有数据，包括待售域名、已售域名、友情链接、注册商图标、站点设置和管理密码
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Save className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">持久化备份</span>
              </div>
              <Button 
                onClick={() => createBackup()}
                disabled={isSaving}
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
                    立即备份
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              在服务器data目录中创建完整备份文件
            </p>
            
            {isSaving && (
              <div className="mt-2">
                <Progress value={saveProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {saveProgress < 100 ? "正在保存备份..." : "保存完成"}
                </p>
              </div>
            )}
          </div>
          
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">下载备份</span>
              </div>
              <Button 
                onClick={downloadBackup}
                variant="outline" 
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                下载JSON
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              下载完整数据备份文件到本地设备
            </p>
          </div>
        </div>
        
        <div className="rounded-md bg-muted/30 p-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">
                上次备份: {lastBackupTime || "从未备份"}
              </span>
            </div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">
                已有备份: {backupCount} 个
              </span>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            系统将每12小时自动创建一次备份，确保您的数据安全
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground bg-muted/20 flex justify-between">
        <span>数据项：{domains.length}个待售域名, {soldDomains.length}个已售域名, {friendlyLinks.length}个友情链接</span>
        <span>备份版本: {BACKUP_VERSION}</span>
      </CardFooter>
    </Card>
  )
} 