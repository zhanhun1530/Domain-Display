"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, RefreshCw, Loader2, FileSearch } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * 密码测试页面
 * 用于测试和调试密码更新功能
 */
export default function PasswordTestPage() {
  const [password, setPassword] = useState("test123")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("normal") // normal 或 force
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [logMessages, setLogMessages] = useState<string[]>([])

  /**
   * 添加日志消息
   */
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogMessages(prev => [...prev, `[${timestamp}] ${message}`])
  }

  /**
   * 清除日志
   */
  const clearLogs = () => {
    setLogMessages([])
  }

  /**
   * 检查密码文件
   */
  const handleCheckPassword = async () => {
    setLoading(true)
    setMessage(null)
    addLog("正在检查密码文件...")

    try {
      const response = await fetch('/api/test/password')
      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        addLog("✅ 密码文件检查完成")
      } else {
        setMessage({ type: "error", text: data.error || "检查密码时发生错误" })
        addLog(`❌ 错误: ${data.error}`)
      }
    } catch (error) {
      setMessage({ type: "error", text: `请求失败: ${error instanceof Error ? error.message : String(error)}` })
      addLog(`❌ 请求失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 更新密码
   */
  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      setMessage({ type: "error", text: "请输入密码" })
      return
    }

    setLoading(true)
    setMessage(null)
    addLog(`正在${mode === "force" ? "强制" : ""}更新密码: ${password}`)

    try {
      const response = await fetch('/api/test/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          mode
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        addLog(`✅ 密码${mode === "force" ? "强制" : ""}更新成功`)
      } else {
        setMessage({ type: "error", text: data.error || "更新密码时发生错误" })
        addLog(`❌ 错误: ${data.error}`)
      }
    } catch (error) {
      setMessage({ type: "error", text: `请求失败: ${error instanceof Error ? error.message : String(error)}` })
      addLog(`❌ 请求失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>密码功能测试工具</CardTitle>
          <CardDescription>用于测试和排查密码更新相关问题</CardDescription>
        </CardHeader>

        <Tabs defaultValue="update">
          <TabsList className="mx-6">
            <TabsTrigger value="update">更新密码</TabsTrigger>
            <TabsTrigger value="logs">操作日志</TabsTrigger>
          </TabsList>

          <TabsContent value="update">
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

              <div className="space-y-2">
                <Label htmlFor="password">测试密码</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入测试密码"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-mode"
                  checked={mode === "force"}
                  onCheckedChange={(checked) => setMode(checked ? "force" : "normal")}
                />
                <Label
                  htmlFor="force-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  使用强制模式 (直接修改JSON文件)
                </Label>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>* 所有操作都会记录到服务器日志</p>
                <p>* 强制模式将直接修改JSON文件，绕过正常流程</p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button onClick={handleUpdatePassword} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新密码"
                )}
              </Button>
              
              <Button variant="outline" onClick={handleCheckPassword} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <FileSearch className="h-4 w-4 mr-2" />
                    检查密码文件
                  </>
                )}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="logs">
            <CardContent>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-md h-60 overflow-y-auto font-mono text-sm">
                {logMessages.length > 0 ? (
                  logMessages.map((log, index) => (
                    <div key={index} className="border-b border-slate-800 pb-1 mb-1 last:border-0">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">尚无日志记录...</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                清除日志
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 