"use client"

import { useState, useEffect } from "react"
import { listDataFiles, fetchData, deleteData } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, RefreshCw, FileJson, AlertCircle, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BackupRestore } from "@/components/backup-restore"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function BackupList() {
  const [files, setFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const { toast } = useToast()
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  // 加载备份文件列表
  const loadBackupFiles = async () => {
    setIsLoading(true)
    try {
      const backupFiles = await listDataFiles()
      // 仅保留backup开头的JSON文件
      const filteredFiles = backupFiles.filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      // 按日期从新到旧排序
      filteredFiles.sort().reverse()
      setFiles(filteredFiles)
    } catch (error) {
      console.error("获取备份文件列表失败:", error)
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法获取服务器备份文件列表",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 组件加载时获取备份文件列表
  useEffect(() => {
    loadBackupFiles()
  }, [])

  // 下载备份文件
  const downloadBackup = async (filename: string) => {
    try {
      // 获取备份数据
      const backupData = await fetchData(filename, null)
      
      if (!backupData) {
        toast({
          variant: "destructive",
          title: "下载失败",
          description: `无法获取备份文件: ${filename}`,
        })
        return
      }
      
      // 转换为JSON字符串
      const backupJson = JSON.stringify(backupData, null, 2)
      
      // 创建Blob对象
      const blob = new Blob([backupJson], { type: "application/json" })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      
      // 使用更安全的方式创建和触发下载
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = filename
      
      // 触发下载
      document.body.appendChild(a)
      a.click()
      
      // 延迟清理，确保下载已开始
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast({
          title: "下载成功",
          description: `已下载备份文件: ${filename}`,
        })
      }, 100)
    } catch (error) {
      console.error("下载备份文件失败:", error)
      toast({
        variant: "destructive",
        title: "下载失败",
        description: "无法下载备份文件",
      })
    }
  }

  // 删除备份文件
  const deleteBackup = async (filename: string) => {
    try {
      const success = await deleteData(filename)
      
      if (success) {
        toast({
          title: "删除成功",
          description: `已删除备份文件: ${filename}`,
        })
        
        // 重新加载文件列表
        loadBackupFiles()
      } else {
        toast({
          variant: "destructive",
          title: "删除失败",
          description: `无法删除备份文件: ${filename}`,
        })
      }
    } catch (error) {
      console.error("删除备份文件失败:", error)
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "删除备份文件时发生错误",
      })
    }
  }
  
  // 打开恢复对话框
  const openRestoreDialog = (filename: string) => {
    setSelectedFile(filename)
    setShowRestoreDialog(true)
  }
  
  // 格式化日期显示
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>服务器备份列表</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadBackupFiles}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <div 
                  key={file} 
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted"
                >
                  <div className="flex items-center">
                    <FileJson className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium">{formatBackupDate(file)}</p>
                      <p className="text-xs text-muted-foreground">{file}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openRestoreDialog(file)}
                    >
                      <RotateCcw className="h-4 w-4 text-green-600" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadBackup(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除备份文件 "{file}" 吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBackup(file)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">暂无备份文件</p>
              <p className="text-xs text-muted-foreground mt-1">
                使用"持久化备份"功能创建服务器备份
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 恢复备份对话框 */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>从备份恢复</DialogTitle>
            <DialogDescription>
              从服务器备份文件恢复数据，将覆盖当前数据
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <BackupRestore filename={selectedFile} />
          )}
          
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 