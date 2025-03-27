"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, FileJson } from "lucide-react"
import { fetchData } from "@/lib/data-service"
import { useDomainContext } from "@/contexts/domain-context"
import { useSite } from "@/contexts/site-context"

// 备份数据类型
interface BackupData {
  version: string
  timestamp: number
  domains?: any[]
  soldDomains?: any[]
  friendlyLinks?: any[]
  siteSettings?: any
  auth?: any
}

export function BackupRestore({ filename }: { filename: string }) {
  const { updateDomains, updateSoldDomains, updateFriendlyLinks } = useDomainContext()
  const { updateSiteName, updateLogoType, updateLogoImage, updateLogoText, updateFavicon } = useSite()
  const { toast } = useToast()
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [restoreSuccess, setRestoreSuccess] = useState<boolean | null>(null)

  // 从服务器获取备份文件并恢复
  const handleRestore = async () => {
    if (isRestoring) return
    
    setIsRestoring(true)
    setRestoreProgress(0)
    setRestoreSuccess(null)
    
    // 模拟进度
    const interval = setInterval(() => {
      setRestoreProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 50)
    
    try {
      // 获取备份数据
      const backupData = await fetchData<BackupData | null>(filename, null)
      
      if (!backupData) {
        throw new Error(`无法获取备份文件: ${filename}`)
      }
      
      // 验证备份数据
      validateBackup(backupData)
      
      // 恢复域名数据
      if (backupData.domains && Array.isArray(backupData.domains)) {
        updateDomains(backupData.domains)
      }
      
      // 恢复已售域名数据
      if (backupData.soldDomains && Array.isArray(backupData.soldDomains)) {
        updateSoldDomains(backupData.soldDomains)
      }
      
      // 恢复友情链接数据
      if (backupData.friendlyLinks && Array.isArray(backupData.friendlyLinks)) {
        updateFriendlyLinks(backupData.friendlyLinks)
      }
      
      // 恢复站点设置
      if (backupData.siteSettings) {
        try {
          const siteSettings = backupData.siteSettings;
          if (siteSettings.siteName) {
            updateSiteName(siteSettings.siteName);
          }
          
          if (siteSettings.logoType) {
            updateLogoType(siteSettings.logoType as "text" | "image");
          }
          
          if (siteSettings.logoImage) {
            updateLogoImage(siteSettings.logoImage);
          }
          
          if (siteSettings.logoText) {
            updateLogoText(siteSettings.logoText);
          }
          
          if (siteSettings.favicon) {
            updateFavicon(siteSettings.favicon);
          }
          
          // 如果有注册商图标，也恢复它们
          if (siteSettings.registrarIcons) {
            // 直接保存到localStorage，因为没有批量更新的方法
            localStorage.setItem("domain-display-site-settings", JSON.stringify(siteSettings));
          }
        } catch (error) {
          console.error("恢复站点设置失败:", error);
        }
      }
      
      // 恢复认证数据
      if (backupData.auth) {
        try {
          const currentAuth = JSON.parse(localStorage.getItem("domain-display-auth") || '{"isLoggedIn":false}')
          const updatedAuth = {
            ...currentAuth,
            password: backupData.auth.password,
          }
          localStorage.setItem("domain-display-auth", JSON.stringify(updatedAuth))
        } catch (error) {
          console.error("恢复认证数据失败:", error)
        }
      }
      
      // 保存最后备份时间
      localStorage.setItem("domain-display-last-backup", Date.now().toString())
      
      // 完成进度
      clearInterval(interval)
      setRestoreProgress(100)
      setRestoreSuccess(true)
      
      toast({
        title: "恢复成功",
        description: "备份数据已成功恢复，页面将在3秒后刷新",
      })
      
      // 延迟刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error("恢复备份失败:", error)
      clearInterval(interval)
      
      setRestoreSuccess(false)
      setIsRestoring(false)
      
      toast({
        variant: "destructive",
        title: "恢复失败",
        description: error instanceof Error ? error.message : "恢复备份时发生错误",
      })
    }
  }
  
  // 验证备份数据
  const validateBackup = (data: any): void => {
    if (!data || typeof data !== "object") {
      throw new Error("无效的备份数据格式")
    }
    
    if (!data.version || !data.timestamp) {
      throw new Error("备份数据缺少必要信息")
    }
    
    // 至少需要有一项数据
    if (
      (!data.domains || !Array.isArray(data.domains)) &&
      (!data.soldDomains || !Array.isArray(data.soldDomains)) &&
      (!data.friendlyLinks || !Array.isArray(data.friendlyLinks)) &&
      (!data.siteSettings || typeof data.siteSettings !== "object")
    ) {
      throw new Error("备份数据不包含有效的恢复内容")
    }
  }
  
  // 从文件名中提取日期显示
  const formatBackupDate = (filename: string): string => {
    try {
      // 从文件名中提取日期部分，例如 backup-2023-07-15.json
      const dateMatch = filename.match(/backup-(\d{4}-\d{2}-\d{2})/)
      if (dateMatch && dateMatch[1]) {
        const dateParts = dateMatch[1].split('-')
        return `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`
      }
      return filename
    } catch {
      return filename
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileJson className="h-5 w-5 mr-2 text-blue-500" />
          <span>从备份中恢复</span>
        </CardTitle>
        <CardDescription>从备份文件 {formatBackupDate(filename)} 恢复数据</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {restoreSuccess === true ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              数据已成功恢复，页面即将刷新...
            </AlertDescription>
          </Alert>
        ) : restoreSuccess === false ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              恢复数据失败，请重试或选择其他备份文件
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              恢复操作将覆盖当前的数据，请确认是否继续
            </AlertDescription>
          </Alert>
        )}
        
        {isRestoring && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>恢复进度</span>
              <span>{restoreProgress}%</span>
            </div>
            <Progress value={restoreProgress} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <FileJson className="h-4 w-4" />
          <span>备份文件：{filename}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleRestore} 
          disabled={isRestoring || restoreSuccess === true}
          className="w-full"
        >
          {isRestoring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              恢复中...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              从此备份恢复
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 