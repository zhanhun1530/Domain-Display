"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  loadPasswordFromServer,
  savePasswordToServer,
  getPasswordFromLocal,
  verifyPassword,
  updatePassword as updateServerPassword
} from "@/lib/password-manager"

// 定义认证上下文类型
interface AuthContextType {
  isLoggedIn: boolean
  password: string
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  updatePassword: (newPassword: string) => Promise<boolean>
  resetPassword: () => Promise<boolean>
}

// 定义认证状态类型
interface AuthState {
  isLoggedIn: boolean
  password: string
}

// 默认密码
const DEFAULT_PASSWORD = "admin123"

// 创建上下文，提供默认值避免null检查
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  password: DEFAULT_PASSWORD,
  isLoading: false,
  login: async () => false,
  logout: () => {},
  updatePassword: async () => false,
  resetPassword: async () => false,
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
  // 认证状态
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, password: DEFAULT_PASSWORD })
  // 添加加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 初始化：从本地存储加载认证信息
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        // 从本地存储获取认证信息
        const storedAuth = getAuthFromStorage()
        
        // 从服务器加载密码
        const serverPassword = await loadPasswordFromServer()
        
        // 更新认证状态，保持登录状态但更新密码
        setAuth({
          isLoggedIn: storedAuth.isLoggedIn,
          password: serverPassword
        })
        
        // 如果密码有变更，更新本地存储但保留登录状态
        if (storedAuth.password !== serverPassword && storedAuth.isLoggedIn) {
          console.log("检测到密码已更新，正在同步登录状态...")
          saveAuthToStorage({
            isLoggedIn: storedAuth.isLoggedIn,
            password: serverPassword
          })
        }
      } catch (error) {
        console.error("初始化认证失败:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  // 登录函数
  const login = async (password: string) => {
    setIsLoading(true)
    try {
      // 使用新的验证方法
      const isValid = await verifyPassword(password)
      
      if (isValid) {
        // 登录成功
        const updatedAuth = { isLoggedIn: true, password }
        setAuth(updatedAuth)
        // 保存到本地存储
        saveAuthToStorage(updatedAuth)
        setIsLoading(false)
        return true
      } else {
        // 密码错误
        console.error("密码错误")
        const updatedAuth = { ...auth, isLoggedIn: false }
        setAuth(updatedAuth)
        // 保存到本地存储
        saveAuthToStorage(updatedAuth)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("登录检查错误:", error)
      setIsLoading(false)
      return false
    }
  }

  // 登出函数
  const logout = (): void => {
    const updatedAuth = { ...auth, isLoggedIn: false }
    // 只更新登录状态，不更改密码
    setAuth(updatedAuth)
    saveAuthToStorage(updatedAuth)
  }

  // 更新密码
  const updatePassword = async (newPassword: string) => {
    setIsLoading(true)
    try {
      // 使用新方法保存密码到服务器
      const success = await updateServerPassword(newPassword)
      
      if (success) {
        // 更新本地认证状态，保持登录状态
        const updatedAuth = { isLoggedIn: true, password: newPassword }
        setAuth(updatedAuth)
        // 保存到本地存储
        saveAuthToStorage(updatedAuth)
        setIsLoading(false)
        return true
      } else {
        console.error("服务器更新密码失败")
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("更新密码错误:", error)
      setIsLoading(false)
      return false
    }
  }

  // 重置密码
  const resetPassword = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      // 重置为默认密码
      const success = await updateServerPassword(DEFAULT_PASSWORD)
      
      if (success) {
        // 更新本地认证状态，保持当前登录状态
        const updatedAuth = { isLoggedIn: auth.isLoggedIn, password: DEFAULT_PASSWORD }
        setAuth(updatedAuth)
        // 保存到本地存储
        saveAuthToStorage(updatedAuth)
        setIsLoading(false)
        return true
      } else {
        console.error("服务器重置密码失败")
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("重置密码错误:", error)
      setIsLoading(false)
      return false
    }
  }

  const contextValue: AuthContextType = {
    isLoggedIn: auth.isLoggedIn,
    password: auth.password,
    isLoading,
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

