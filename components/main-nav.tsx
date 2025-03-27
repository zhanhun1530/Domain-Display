"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSite } from "@/contexts/site-context"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { Shield } from "lucide-react"
import { useEffect, useState } from "react"

export function MainNav() {
  const { isLoggedIn } = useAuth()
  const { settings } = useSite()
  const [mounted, setMounted] = useState(false)

  // 确保只在客户端渲染后使用设置
  useEffect(() => {
    setMounted(true)
  }, [])

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
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">
                <Shield className="h-4 w-4 mr-2" />
                管理员登录
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

