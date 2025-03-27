/**
 * 密码管理工具 - 实现密码的永久持久化存储
 */

import { saveData, fetchData } from "@/lib/data-service"

// 密码存储文件名
const PASSWORD_FILE = "auth-credentials.json"
// localStorage密钥
const AUTH_STORAGE_KEY = "domain-display-auth"
// 默认管理员密码
const DEFAULT_PASSWORD = "admin123"

/**
 * 密码数据接口
 */
interface PasswordData {
  password: string
  lastUpdated: number
  version: string
}

/**
 * 从服务器加载密码
 */
export async function loadPasswordFromServer(): Promise<string> {
  try {
    console.log("从服务器加载密码...")
    const data = await fetchData<PasswordData | null>(PASSWORD_FILE, null)
    
    if (data && data.password) {
      console.log("✅ 成功从服务器加载密码")
      // 同步到localStorage以供本地使用
      syncPasswordToLocal(data.password)
      return data.password
    } else {
      console.log("⚠️ 服务器无密码数据，使用本地密码")
      // 尝试从localStorage获取密码
      const localPassword = getPasswordFromLocal()
      // 如果本地有密码，保存到服务器
      if (localPassword !== DEFAULT_PASSWORD) {
        await savePasswordToServer(localPassword)
      }
      return localPassword
    }
  } catch (error) {
    console.error("❌ 从服务器加载密码失败:", error)
    return getPasswordFromLocal()
  }
}

/**
 * 将密码保存到服务器
 */
export async function savePasswordToServer(password: string): Promise<boolean> {
  try {
    console.log("保存密码到服务器...")
    
    // 创建密码数据对象
    const passwordData: PasswordData = {
      password,
      lastUpdated: Date.now(),
      version: "1.0"
    }
    
    // 保存到服务器
    const success = await saveData(PASSWORD_FILE, passwordData)
    
    if (success) {
      console.log("✅ 密码已成功保存到服务器")
      // 同步到localStorage
      syncPasswordToLocal(password)
    } else {
      console.error("❌ 保存密码到服务器失败")
    }
    
    return success
  } catch (error) {
    console.error("❌ 保存密码到服务器时发生错误:", error)
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
      } catch (e) {
        console.error("解析本地认证数据失败:", e)
      }
    }
    
    // 更新密码
    auth.password = password
    
    // 保存回localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    console.log("✅ 密码已同步到本地存储")
  } catch (error) {
    console.error("同步密码到本地存储失败:", error)
  }
}

/**
 * 验证密码
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  // 首先从服务器获取密码
  const serverPassword = await loadPasswordFromServer()
  
  // 如果服务器获取失败，使用本地密码
  const correctPassword = serverPassword || getPasswordFromLocal()
  
  return inputPassword === correctPassword
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  // 保存到服务器
  const success = await savePasswordToServer(newPassword)
  
  if (!success) {
    // 如果服务器保存失败，至少尝试保存到localStorage
    syncPasswordToLocal(newPassword)
  }
  
  return success
} 