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
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [redirecting, setRedirecting] = useState(false)
  const { isLoggedIn, login, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果用户已登录，重定向到首页
    if (isLoggedIn) {
      setRedirecting(true)
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (!password) {
      setLoginError("请输入密码")
      return
    }

    try {
      const success = await login(password)
      
      if (success) {
        setRedirecting(true)
        router.push("/dashboard")
      } else {
        setLoginError("登录失败：密码错误")
      }
    } catch (error) {
      console.error("登录过程中发生错误:", error)
      setLoginError("登录失败：系统错误，请稍后再试")
    }
  }

  // 如果正在重定向或加载中，显示加载状态
  if (redirecting || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">
          {isLoading ? "正在验证..." : "正在重定向..."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
          </div>
          <CardTitle className="text-2xl font-bold text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">输入密码登录后台管理系统</CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="输入管理员密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

