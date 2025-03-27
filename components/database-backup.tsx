"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Database, Download, AlertCircle, HardDrive, Loader2, Upload, RotateCcw } from "lucide-react"

export default function DatabaseBackup() {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 下载SQLite数据库文件
  const downloadDatabaseFile = async () => {
    setIsDownloading(true)
    
    try {
      // 获取数据库文件
      const response = await fetch('/api/db-download')
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`)
      }
      
      // 获取blob数据
      const blob = await response.blob()
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      
      // 生成文件名
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const filename = `app-data-${dateStr}.db`
      
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
          description: "SQLite数据库文件已下载至您的设备",
        })
        setIsDownloading(false)
      }, 100)
    } catch (error: any) {
      console.error("下载数据库文件失败:", error)
      
      toast({
        variant: "destructive",
        title: "下载失败",
        description: error.message || "准备下载数据库时发生错误",
      })
      setIsDownloading(false)
    }
  }

  // 触发文件选择对话框
  const handleRestoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  // 处理文件选择并恢复数据库
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // 检查文件类型
    if (!file.name.endsWith('.db')) {
      toast({
        variant: "destructive",
        title: "文件类型错误",
        description: "请选择 .db 格式的SQLite数据库文件",
      })
      return
    }
    
    setIsRestoring(true)
    
    try {
      // 创建FormData对象
      const formData = new FormData()
      formData.append('database', file)
      
      // 发送数据库文件到服务器
      const response = await fetch('/api/db-restore', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '恢复数据库失败')
      }
      
      const result = await response.json()
      
      toast({
        title: "恢复成功",
        description: "数据库已成功恢复，将在几秒后自动刷新页面",
      })
      
      // 延迟后刷新页面以应用更改
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error: any) {
      console.error("恢复数据库失败:", error)
      
      toast({
        variant: "destructive",
        title: "恢复失败",
        description: error.message || "恢复数据库时发生错误",
      })
    } finally {
      setIsRestoring(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary" />
          SQLite数据库备份
        </CardTitle>
        <CardDescription>
          下载或恢复完整的SQLite数据库文件，包含所有系统数据
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">数据库文件备份</span>
              </div>
              <Button 
                onClick={downloadDatabaseFile}
                disabled={isDownloading}
                variant="default" 
                size="sm"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    下载中
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    下载数据库
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              下载完整的SQLite数据库文件(app-data.db)，用于备份或迁移
            </p>
          </div>
          
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <RotateCcw className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">数据库恢复</span>
              </div>
              
              {/* 隐藏的文件输入 */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".db" 
                className="hidden" 
              />
              
              <Button 
                onClick={handleRestoreClick}
                disabled={isRestoring}
                variant="outline" 
                size="sm"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    恢复中
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    恢复数据库
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              从备份文件恢复数据库，将替换现有的所有数据
            </p>
          </div>
        </div>
        
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-600">
            注意：恢复数据库会替换当前所有数据，请确保您有当前数据的备份
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground bg-muted/20">
        <span>文件路径: data/app-data.db</span>
      </CardFooter>
    </Card>
  )
} 