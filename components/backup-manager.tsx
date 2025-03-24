"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { exportBackup, importBackup } from "@/utils/backup"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"

export default function BackupManager() {
  const [importError, setImportError] = useState("")
  const [importSuccess, setImportSuccess] = useState("")
  const [exportSuccess, setExportSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理导出备份
  const handleExport = () => {
    try {
      exportBackup()
      setExportSuccess("备份已成功导出")

      // 3秒后清除成功消息
      setTimeout(() => {
        setExportSuccess("")
      }, 3000)
    } catch (error) {
      console.error("导出备份失败:", error)
    }
  }

  // 处理导入备份
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("")
    setImportSuccess("")

    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setImportError("请选择有效的JSON备份文件")
      return
    }

    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = importBackup(content)

        if (success) {
          setImportSuccess("备份已成功导入，页面将在3秒后刷新")

          // 3秒后刷新页面以应用导入的数据
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        } else {
          setImportError("导入备份失败：无效的备份文件")
        }
      } catch (error) {
        setImportError("导入备份失败：文件格式错误")
      }
    }

    reader.onerror = () => {
      setImportError("读取文件失败")
    }

    reader.readAsText(file)
  }

  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>备份管理</CardTitle>
        <CardDescription>导出或导入您的数据备份</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        {importSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{importSuccess}</AlertDescription>
          </Alert>
        )}
        {exportSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{exportSuccess}</AlertDescription>
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

