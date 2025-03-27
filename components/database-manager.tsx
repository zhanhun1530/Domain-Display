"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database, RefreshCw, Loader2, CheckCircle2 } from "lucide-react"

export default function DatabaseManager() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [dbStatus, setDbStatus] = useState<{ ready: boolean; message: string } | null>(null)

  const handleInitDatabase = async () => {
    if (!confirm("确定要初始化SQLite数据库并迁移现有数据吗？这将创建数据库并从JSON文件迁移所有数据。")) {
      return
    }
    
    setIsInitializing(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/db-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setMessage({ type: "success", text: "数据库初始化成功！所有数据已成功迁移到SQLite数据库。" })
        // 更新数据库状态
        await checkDatabaseStatus()
      } else {
        setMessage({ type: "error", text: `数据库初始化失败: ${result.error || '未知错误'}` })
      }
    } catch (error) {
      console.error("数据库初始化错误:", error)
      setMessage({ type: "error", text: "初始化过程中发生错误，请查看控制台获取详情。" })
    } finally {
      setIsInitializing(false)
    }
  }
  
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/db-init')
      const result = await response.json()
      
      setDbStatus({
        ready: result.ready,
        message: result.message || (result.ready ? "数据库正常运行" : "数据库尚未初始化")
      })
    } catch (error) {
      console.error("检查数据库状态错误:", error)
      setDbStatus({
        ready: false,
        message: "无法获取数据库状态"
      })
    }
  }
  
  // 初始检查数据库状态
  if (dbStatus === null) {
    checkDatabaseStatus()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          SQLite数据库管理
        </CardTitle>
        <CardDescription>
          管理SQLite数据库，将数据永久保存在data目录中
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {dbStatus && (
          <div className="flex items-center space-x-2 text-sm mb-4">
            <div className={`w-3 h-3 rounded-full ${dbStatus.ready ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span>{dbStatus.message}</span>
          </div>
        )}
        
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} 
                 className={message.type === "success" ? "bg-green-50 border-green-200" : ""}>
            {message.type === "error" ? 
              <AlertCircle className="h-4 w-4" /> : 
              <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <AlertDescription className={message.type === "success" ? "text-green-600" : ""}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>SQLite数据库将所有数据保存在<code className="bg-muted px-1 rounded">data/app-data.db</code>文件中，提供以下优势：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>单文件存储，便于备份和迁移</li>
            <li>数据事务和完整性保证</li>
            <li>比JSON文件更高效的数据操作</li>
            <li>支持复杂查询和数据关系</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={checkDatabaseStatus}
          disabled={isInitializing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          检查状态
        </Button>
        
        <Button 
          variant="default" 
          onClick={handleInitDatabase} 
          disabled={isInitializing}
        >
          {isInitializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              正在初始化...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              初始化数据库
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 