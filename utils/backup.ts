// 备份数据类型
export interface BackupData {
  version: string
  timestamp: number
  user: {
    username: string
    password: string
  }
  domains: any[]
  soldDomains: any[]
  friendlyLinks: any[]
}

// 当前备份版本
const BACKUP_VERSION = "1.0.0"

// 创建备份
export function createBackup(): BackupData {
  // 从localStorage获取数据
  const user = JSON.parse(localStorage.getItem("domain-display-user") || "{}")
  const domains = JSON.parse(localStorage.getItem("domain-display-domains") || "[]")
  const soldDomains = JSON.parse(localStorage.getItem("domain-display-sold-domains") || "[]")
  const friendlyLinks = JSON.parse(localStorage.getItem("domain-display-friendly-links") || "[]")

  // 创建备份对象
  const backup: BackupData = {
    version: BACKUP_VERSION,
    timestamp: Date.now(),
    user: {
      username: user.username || "admin",
      password: user.password || "password",
    },
    domains,
    soldDomains,
    friendlyLinks,
  }

  return backup
}

// 导出备份为文件
export function exportBackup(): void {
  try {
    // 创建备份数据
    const backup = createBackup()

    // 转换为JSON字符串
    const backupJson = JSON.stringify(backup, null, 2)

    // 创建Blob对象
    const blob = new Blob([backupJson], { type: "application/json" })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    // 设置文件名（使用当前日期）
    const date = new Date()
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    a.download = `domain-display-backup-${formattedDate}.json`

    // 触发下载
    document.body.appendChild(a)
    a.click()

    // 清理
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return
  } catch (error) {
    console.error("导出备份失败:", error)
    throw new Error("导出备份失败")
  }
}

// 验证备份数据
export function validateBackup(data: any): boolean {
  // 检查基本结构
  if (!data || typeof data !== "object") return false
  if (!data.version || !data.timestamp) return false

  // 检查用户数据
  if (!data.user || !data.user.username || !data.user.password) return false

  // 检查域名数据
  if (!Array.isArray(data.domains)) return false
  if (!Array.isArray(data.soldDomains)) return false
  if (!Array.isArray(data.friendlyLinks)) return false

  return true
}

// 导入备份
export function importBackup(backupJson: string): boolean {
  try {
    // 解析JSON
    const backup = JSON.parse(backupJson)

    // 验证备份数据
    if (!validateBackup(backup)) {
      throw new Error("无效的备份文件")
    }

    // 保存用户数据
    const currentUser = JSON.parse(localStorage.getItem("domain-display-user") || "{}")
    const updatedUser = {
      ...currentUser,
      username: backup.user.username,
      password: backup.user.password,
    }
    localStorage.setItem("domain-display-user", JSON.stringify(updatedUser))

    // 保存域名数据
    localStorage.setItem("domain-display-domains", JSON.stringify(backup.domains))
    localStorage.setItem("domain-display-sold-domains", JSON.stringify(backup.soldDomains))
    localStorage.setItem("domain-display-friendly-links", JSON.stringify(backup.friendlyLinks))

    return true
  } catch (error) {
    console.error("导入备份失败:", error)
    return false
  }
}

