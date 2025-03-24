"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [redirecting, setRedirecting] = useState(false)
  const { user, login, resetCredentials } = useAuth()
  const router = useRouter()

  // 登录表单状态
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // 重置表单状态
  const [currentPassword, setCurrentPassword] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")

  useEffect(() => {
    // 如果用户已登录，重定向到首页
    if (user?.isLoggedIn) {
      setRedirecting(true)
      router.push("/")
    }
  }, [user, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (!username || !password) {
      setLoginError("请输入用户名和密码")
      return
    }

    const success = login(username, password)
    if (success) {
      setRedirecting(true)
      router.push("/")
    } else {
      setLoginError("登录失败：用户名或密码错误。")
    }
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetSuccess("")

    // 验证输入
    if (!currentPassword) {
      setResetError("请输入当前密码")
      return
    }

    if (!newUsername || !newPassword) {
      setResetError("请输入新的用户名和密码")
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError("两次输入的新密码不一致")
      return
    }

    // 重置凭据
    const success = resetCredentials(currentPassword, newUsername, newPassword)
    if (success) {
      setResetSuccess("账号和密码已重置成功，请使用新凭据登录")
      setCurrentPassword("")
      setNewUsername("")
      setNewPassword("")
      setConfirmPassword("")

      // 3秒后切换到登录标签
      setTimeout(() => {
        setActiveTab("login")
      }, 3000)
    } else {
      setResetError("重置失败：当前密码不正确")
    }
  }

  // 如果正在重定向，显示加载状态
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">正在重定向...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">账号管理</CardTitle>
          <CardDescription className="text-center">登录系统或重置账号密码</CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="reset">重置账号</TabsTrigger>
          </TabsList>

          {/* 登录标签内容 */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  登录
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* 重置标签内容 */}
          <TabsContent value="reset">
            <form onSubmit={handleReset}>
              <CardContent className="space-y-4 pt-4">
                {resetError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                {resetSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">{resetSuccess}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="输入当前密码"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-username">新用户名</Label>
                  <Input
                    id="new-username"
                    placeholder="输入新用户名"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="输入新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  重置账号和密码
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

