"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 定义用户类型
interface User {
  username: string
  password: string
  isLoggedIn: boolean
}

// 定义认证上下文类型
interface AuthContextType {
  user: User
  login: (username: string, password: string) => boolean
  logout: () => void
  updateUsername: (newUsername: string) => void
  updatePassword: (newPassword: string) => void
  resetCredentials: (currentPassword: string, newUsername: string, newPassword: string) => boolean
}

// 默认用户
const DEFAULT_USER: User = {
  username: "admin",
  password: "password",
  isLoggedIn: false,
}

// 创建上下文，提供默认值避免null检查
const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  login: () => false,
  logout: () => {},
  updateUsername: () => {},
  updatePassword: () => {},
  resetCredentials: () => false,
})

// 本地存储键
const USER_STORAGE_KEY = "domain-display-user"

// 从本地存储获取用户
function getUserFromStorage(): User {
  if (typeof window === "undefined") {
    return DEFAULT_USER
  }

  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      return JSON.parse(storedUser)
    }
  } catch (error) {
    console.error("Error reading user from localStorage:", error)
  }

  // 如果没有存储的用户或解析错误，返回默认用户
  return DEFAULT_USER
}

// 保存用户到本地存储
function saveUserToStorage(user: User): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error("Error saving user to localStorage:", error)
  }
}

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  // 始终使用默认用户初始化，避免null值
  const [user, setUser] = useState<User>(DEFAULT_USER)

  // 初始化：从本地存储加载用户
  useEffect(() => {
    const storedUser = getUserFromStorage()
    setUser(storedUser)
  }, [])

  // 登录函数
  const login = (username: string, password: string): boolean => {
    // 直接从存储获取最新用户数据
    const currentUser = getUserFromStorage()

    if (username === currentUser.username && password === currentUser.password) {
      const loggedInUser = { ...currentUser, isLoggedIn: true }
      setUser(loggedInUser)
      saveUserToStorage(loggedInUser)
      return true
    }
    return false
  }

  // 登出函数
  const logout = (): void => {
    const loggedOutUser = { ...user, isLoggedIn: false }
    setUser(loggedOutUser)
    saveUserToStorage(loggedOutUser)
  }

  // 更新用户名
  const updateUsername = (newUsername: string): void => {
    if (!newUsername.trim()) return

    const updatedUser = { ...getUserFromStorage(), username: newUsername }
    setUser(updatedUser)
    saveUserToStorage(updatedUser)
  }

  // 更新密码
  const updatePassword = (newPassword: string): void => {
    if (!newPassword.trim()) return

    const updatedUser = { ...getUserFromStorage(), password: newPassword }
    setUser(updatedUser)
    saveUserToStorage(updatedUser)
  }

  // 重置凭据（需要当前密码）
  const resetCredentials = (currentPassword: string, newUsername: string, newPassword: string): boolean => {
    const currentUser = getUserFromStorage()

    // 验证当前密码
    if (currentPassword !== currentUser.password) {
      return false
    }

    // 更新用户名和密码
    if (newUsername.trim() && newPassword.trim()) {
      const updatedUser = {
        ...currentUser,
        username: newUsername,
        password: newPassword,
        isLoggedIn: false, // 重置后需要重新登录
      }
      setUser(updatedUser)
      saveUserToStorage(updatedUser)
      return true
    }

    return false
  }

  const contextValue = {
    user,
    login,
    logout,
    updateUsername,
    updatePassword,
    resetCredentials,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// 使用认证上下文的钩子
export function useAuth() {
  return useContext(AuthContext)
}

