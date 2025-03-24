"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

export function MainNav() {
  const { user } = useAuth()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          域名展示
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {user?.isLoggedIn ? (
            <UserMenu />
          ) : (
            <Button asChild>
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

