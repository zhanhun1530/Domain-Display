"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 定义认证上下文类型
interface AuthContextType {
  isLoggedIn: boolean
  password: string
  login: (password: string) => boolean
  logout: () => void
  updatePassword: (newPassword: string) => void
  resetPassword: () => void
}

// 默认密码
const DEFAULT_PASSWORD = "admin123"

// 创建上下文，提供默认值避免null检查
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  password: DEFAULT_PASSWORD,
  login: () => false,
  logout: () => {},
  updatePassword: () => {},
  resetPassword: () => {},
})

// 本地存储键
const AUTH_STORAGE_KEY = "domain-display-auth"

// 从本地存储获取认证信息
function getAuthFromStorage(): { isLoggedIn: boolean; password: string } {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, password: DEFAULT_PASSWORD }
  }

  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      return JSON.parse(storedAuth)
    }
  } catch (error) {
    console.error("Error reading auth from localStorage:", error)
  }

  // 如果没有存储的认证信息或解析错误，返回默认值
  return { isLoggedIn: false, password: DEFAULT_PASSWORD }
}

// 保存认证信息到本地存储
function saveAuthToStorage(auth: { isLoggedIn: boolean; password: string }): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  } catch (error) {
    console.error("Error saving auth to localStorage:", error)
  }
}

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  // 初始化状态
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; password: string }>({
    isLoggedIn: false,
    password: DEFAULT_PASSWORD,
  })

  // 初始化：从本地存储加载认证信息
  useEffect(() => {
    const storedAuth = getAuthFromStorage()
    setAuth(storedAuth)
  }, [])

  // 登录函数
  const login = (password: string): boolean => {
    const currentAuth = getAuthFromStorage()

    if (password === currentAuth.password) {
      const updatedAuth = { ...currentAuth, isLoggedIn: true }
      setAuth(updatedAuth)
      saveAuthToStorage(updatedAuth)
      return true
    }
    return false
  }

  // 登出函数
  const logout = (): void => {
    const updatedAuth = { ...auth, isLoggedIn: false }
    setAuth(updatedAuth)
    saveAuthToStorage(updatedAuth)
  }

  // 更新密码
  const updatePassword = (newPassword: string): void => {
    if (!newPassword.trim()) return

    const updatedAuth = { ...auth, password: newPassword }
    setAuth(updatedAuth)
    saveAuthToStorage(updatedAuth)
  }

  // 重置密码
  const resetPassword = (): void => {
    const updatedAuth = { ...auth, password: DEFAULT_PASSWORD }
    setAuth(updatedAuth)
    saveAuthToStorage(updatedAuth)
  }

  const contextValue = {
    isLoggedIn: auth.isLoggedIn,
    password: auth.password,
    login,
    logout,
    updatePassword,
    resetPassword,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// 使用认证上下文的钩子
export function useAuth() {
  return useContext(AuthContext)
}

