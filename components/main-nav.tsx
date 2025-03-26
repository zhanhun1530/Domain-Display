"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSite } from "@/contexts/site-context"
import { Button } from "@/components/ui/button"
import { Shield, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function MainNav() {
  const { user, logout } = useAuth()
  const { settings } = useSite()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // 确保只在客户端渲染后使用设置
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // 如果未挂载，显示默认值
  if (!mounted) {
    return (
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl">域名展示</span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">
                <Shield className="h-4 w-4 mr-2" />
                管理员登录
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center">
          {settings.logoType === "image" && settings.logoImage ? (
            <div className="h-8 w-auto">
              <img
                src={settings.logoImage || "/placeholder.svg"}
                alt={settings.siteName || "域名展示"}
                className="h-full w-auto object-contain"
              />
            </div>
          ) : (
            <span className="font-bold text-xl">{settings.logoText || settings.siteName || "域名展示"}</span>
          )}
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {user?.isAdmin ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <Shield className="h-4 w-4" />
                <span>控制台</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
            >
              <Shield className="h-4 w-4" />
              <span>管理员登录</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

