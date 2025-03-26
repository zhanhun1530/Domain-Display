"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

export default function PasswordManager() {
  const { updatePassword, resetPassword, login } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUpdatePassword = useCallback(() => {
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "请填写所有字段" })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "两次输入的新密码不一致" })
      return
    }

    if (!login(currentPassword)) {
      setMessage({ type: "error", text: "当前密码不正确" })
      return
    }

    updatePassword(newPassword)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setMessage({ type: "success", text: "密码已成功更新" })
  }, [currentPassword, newPassword, confirmPassword, updatePassword, login])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUpdatePassword()
  }

  const handleResetPassword = () => {
    if (confirm("确定要重置密码为默认值吗？")) {
      resetPassword()
      setMessage({ type: "success", text: "密码已重置为默认值: admin123" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>密码管理</CardTitle>
        <CardDescription>更新或重置管理员密码</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
            <Label htmlFor="current-password">当前密码</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="输入当前密码"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认新密码</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit">更新密码</Button>
          <Button type="button" variant="outline" onClick={handleResetPassword}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置为默认密码
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

