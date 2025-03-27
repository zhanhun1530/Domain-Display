"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Database, Download, Trash2, Loader2, RotateCcw } from "lucide-react"

interface BackupFile {
  name: string
  date: Date
  size: number
}

export default function DatabaseBackupList() {
  const { toast } = useToast()
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingFile, setProcessingFile] = useState<string | null>(null)
  
  // 获取备份列表
  const fetchBackups = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/db-backups')
      
      if (!response.ok) {
        throw new Error('获取备份列表失败')
      }
      
      const data = await response.json()
      
      if (data.backupFiles && Array.isArray(data.backupFiles)) {
        // 转换数据
        const formattedBackups = data.backupFiles.map((file: any) => ({
          name: file.name,
          date: new Date(file.lastModified),
          size: file.size
        })).sort((a: BackupFile, b: BackupFile) => b.date.getTime() - a.date.getTime())
        
        setBackups(formattedBackups)
      }
    } catch (error) {
      console.error("获取备份列表失败:", error)
      toast({
        variant: "destructive",
        title: "获取失败",
        description: "无法获取数据库备份列表"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 初始加载时获取备份列表
  useEffect(() => {
    fetchBackups()
  }, [])
  
  // 下载特定备份文件
  const downloadBackup = async (filename: string) => {
    setProcessingFile(filename)
    
    try {
      const response = await fetch(`/api/db-backups?file=${encodeURIComponent(filename)}`)
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`)
      }
      
      // 获取blob数据
      const blob = await response.blob()
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      
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
          description: `备份文件 ${filename} 已下载`,
        })
        setProcessingFile(null)
      }, 100)
    } catch (error) {
      console.error("下载备份失败:", error)
      toast({
        variant: "destructive",
        title: "下载失败",
        description: "无法下载备份文件"
      })
      setProcessingFile(null)
    }
  }
  
  // 恢复特定备份文件
  const restoreBackup = async (filename: string) => {
    if (!confirm(`确定要恢复此备份吗？当前数据将被替换为 ${filename} 中的数据。`)) {
      return
    }
    
    setProcessingFile(filename)
    
    try {
      const response = await fetch('/api/db-restore-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '恢复备份失败')
      }
      
      toast({
        title: "恢复成功",
        description: "数据库已成功从备份恢复，将在几秒后刷新页面",
      })
      
      // 延迟后刷新页面以应用更改
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error: any) {
      console.error("恢复备份失败:", error)
      toast({
        variant: "destructive",
        title: "恢复失败",
        description: error.message || "恢复备份时发生错误"
      })
    } finally {
      setProcessingFile(null)
    }
  }
  
  // 删除特定备份文件
  const deleteBackup = async (filename: string) => {
    if (!confirm(`确定要删除备份 ${filename} 吗？此操作不可撤销。`)) {
      return
    }
    
    setProcessingFile(filename)
    
    try {
      const response = await fetch('/api/db-backups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除备份失败')
      }
      
      toast({
        title: "删除成功",
        description: `备份文件 ${filename} 已删除`,
      })
      
      // 刷新备份列表
      fetchBackups()
    } catch (error: any) {
      console.error("删除备份失败:", error)
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error.message || "删除备份时发生错误"
      })
      setProcessingFile(null)
    }
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary" />
          数据库备份历史
        </CardTitle>
        <CardDescription>
          管理自动创建的数据库备份文件
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无数据库备份文件
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文件名</TableHead>
                <TableHead>备份时间</TableHead>
                <TableHead>大小</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.name}>
                  <TableCell className="font-mono text-xs truncate max-w-[200px]">
                    {backup.name}
                  </TableCell>
                  <TableCell>{backup.date.toLocaleString()}</TableCell>
                  <TableCell>{formatFileSize(backup.size)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup.name)}
                        disabled={processingFile === backup.name}
                      >
                        {processingFile === backup.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreBackup(backup.name)}
                        disabled={processingFile === backup.name}
                      >
                        {processingFile === backup.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBackup(backup.name)}
                        disabled={processingFile === backup.name}
                      >
                        {processingFile === backup.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/20 text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>备份文件数量: {backups.length}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchBackups}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            刷新列表
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 