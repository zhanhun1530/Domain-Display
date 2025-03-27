/**
 * 密码管理工具 - 使用SQLite实现密码的永久持久化存储
 */

import { getPassword, savePassword } from "@/lib/sqlite-service"

// localStorage密钥，用于本地状态同步
const AUTH_STORAGE_KEY = "domain-display-auth"
// 默认管理员密码
const DEFAULT_PASSWORD = "admin123"

/**
 * 从服务器(SQLite数据库)加载密码
 */
export async function loadPasswordFromServer(): Promise<string> {
  try {
    console.log("从SQLite数据库加载密码...")
    const data = getPassword()
    
    if (data && data.password) {
      console.log("✅ 成功从SQLite数据库加载密码")
      // 同步到localStorage以供本地使用
      syncPasswordToLocal(data.password)
      return data.password
    } else {
      console.log("⚠️ 数据库无密码数据，使用本地密码")
      // 尝试从localStorage获取密码
      const localPassword = getPasswordFromLocal()
      // 如果本地有密码，保存到服务器
      if (localPassword !== DEFAULT_PASSWORD) {
        await savePasswordToServer(localPassword)
      }
      return localPassword
    }
  } catch (error) {
    console.error("❌ 从SQLite数据库加载密码失败:", error)
    return getPasswordFromLocal()
  }
}

/**
 * 将密码保存到服务器(SQLite数据库)
 */
export async function savePasswordToServer(password: string): Promise<boolean> {
  try {
    console.log("保存密码到SQLite数据库...")
    
    // 创建密码数据对象
    const passwordData = {
      password,
      lastUpdated: Date.now(),
      version: "1.0"
    }
    
    // 保存到SQLite数据库
    const success = savePassword(passwordData)
    
    if (success) {
      console.log("✅ 密码已成功保存到SQLite数据库")
      // 同步到localStorage
      syncPasswordToLocal(password)
    } else {
      console.error("❌ 保存密码到SQLite数据库失败")
    }
    
    return success
  } catch (error) {
    console.error("❌ 保存密码到SQLite数据库时发生错误:", error)
    return false
  }
}

/**
 * 从localStorage获取密码
 */
export function getPasswordFromLocal(): string {
  if (typeof window === "undefined") {
    return DEFAULT_PASSWORD
  }
  
  try {
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authStr) {
      const auth = JSON.parse(authStr)
      return auth.password || DEFAULT_PASSWORD
    }
  } catch (error) {
    console.error("读取本地密码失败:", error)
  }
  
  return DEFAULT_PASSWORD
}

/**
 * 同步密码到localStorage
 */
export function syncPasswordToLocal(password: string): void {
  if (typeof window === "undefined") {
    return
  }
  
  try {
    // 获取当前认证状态
    let auth = { isLoggedIn: false, password: DEFAULT_PASSWORD }
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY)
    
    if (authStr) {
      try {
        auth = JSON.parse(authStr)
        // 如果已经登录，保持登录状态
        console.log("同步密码时保留当前登录状态:", auth.isLoggedIn)
      } catch (e) {
        console.error("解析本地认证数据失败:", e)
      }
    }
    
    // 更新密码但保留登录状态
    auth.password = password
    
    // 保存回localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    console.log("✅ 密码已同步到本地存储，登录状态:", auth.isLoggedIn)
  } catch (error) {
    console.error("同步密码到本地存储失败:", error)
  }
}

/**
 * 验证密码
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  // 首先从SQLite数据库获取密码
  const serverPassword = await loadPasswordFromServer()
  
  // 如果服务器获取失败，使用本地密码
  const correctPassword = serverPassword || getPasswordFromLocal()
  
  return inputPassword === correctPassword
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  // 保存到SQLite数据库
  const success = await savePasswordToServer(newPassword)
  
  if (!success) {
    // 如果服务器保存失败，至少尝试保存到localStorage
    syncPasswordToLocal(newPassword)
  }
  
  return success
} 