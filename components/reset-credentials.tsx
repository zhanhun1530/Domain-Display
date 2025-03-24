"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function ResetCredentials() {
  const [success, setSuccess] = useState(false)

  const handleReset = () => {
    if (confirm("确定要重置用户凭据到默认值吗？这将把用户名重置为 'admin'，密码重置为 'password'。")) {
      const defaultUser = {
        username: "admin",
        password: "password",
        isLoggedIn: false,
      }

      localStorage.setItem("user", JSON.stringify(defaultUser))
      setSuccess(true)

      // 3秒后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>重置凭据</CardTitle>
        <CardDescription>如果您忘记了用户名或密码，可以将其重置为默认值</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-600">
              凭据已重置为默认值。用户名: admin, 密码: password。页面将在3秒后刷新...
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground">此操作将把您的用户名重置为 "admin"，密码重置为 "password"。</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleReset} disabled={success}>
          <RefreshCw className="h-4 w-4 mr-2" />
          重置凭据
        </Button>
      </CardFooter>
    </Card>
  )
}

