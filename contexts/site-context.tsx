"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 定义站点设置类型
interface SiteSettings {
  siteName: string
  logoType: "text" | "image"
  logoImage?: string
  logoText?: string
  favicon: string
  registrarIcons: {
    [key: string]: string
  }
}

// 定义站点上下文类型
interface SiteContextType {
  settings: SiteSettings
  updateSiteName: (name: string) => void
  updateLogoType: (type: "text" | "image") => void
  updateLogoImage: (url: string) => void
  updateLogoText: (text: string) => void
  updateFavicon: (url: string) => void
  addRegistrarIcon: (name: string, svg: string) => void
  updateRegistrarIcon: (name: string, svg: string) => void
  removeRegistrarIcon: (name: string) => void
  resetSettings: () => void
}

// 默认设置
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "域名展示",
  logoType: "text",
  logoText: "域名展示",
  favicon: "https://xn--1xa.team/img/favicon.ico",
  registrarIcons: {
    aliyun: `<svg t="1742606538431" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3384" width="24" height="24"><path d="M0 0h1024v1024H0z" fill="#FFFFFF" p-id="3385"></path><path d="M362.752 476.864h298.496v67.328H362.752z" fill="#FF8F00" p-id="3386"></path><path d="M810.816 232.64H613.312l47.68 67.456 144 44.16a62.272 62.272 0 0 1 43.456 59.776V619.968a62.272 62.272 0 0 1-43.52 59.84l-144 44.096-47.616 67.456h197.504A149.184 149.184 0 0 0 960 642.176V381.824a149.184 149.184 0 0 0-149.184-149.12z m-597.632 0h197.504L363.008 300.16l-144 44.16a62.272 62.272 0 0 0-43.456 59.776V619.968a62.272 62.272 0 0 0 43.52 59.84l144 44.096 47.616 67.456H213.184A149.184 149.184 0 0 1 64 642.176V381.824a149.184 149.184 0 0 1 149.184-149.12z" fill="#FF8F00" p-id="3387"></path></svg>`,
    tencent: `<svg t="1742607317530" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7697" width="24" height="24"><path d="M465.46176 165.888a349.184 349.184 0 0 0-126.976 46.592l-9.728 5.632a235.52 235.52 0 0 0-20.992 15.36 303.104 303.104 0 0 0-86.528 108.032 344.064 344.064 0 0 0-21.504 60.928c-3.072 10.752-7.168 15.36-13.312 15.36A334.336 334.336 0 0 0 102.45376 451.584a388.096 388.096 0 0 0-51.2 41.984 212.992 212.992 0 0 0-51.2 143.36 208.384 208.384 0 0 0 68.608 157.696 227.84 227.84 0 0 0 96.256 55.808c40.448 10.752 28.672 10.24 345.6 10.24 266.752 0 293.888 0 311.808-3.072a334.848 334.848 0 0 0 57.856-14.848l9.728-4.608a264.704 264.704 0 0 0 47.616-29.184A222.208 222.208 0 0 0 1024.05376 636.416a261.632 261.632 0 0 0-13.312-73.216 27.136 27.136 0 0 1-3.072-8.192 198.656 198.656 0 0 0-19.968-37.376l-9.728-12.288a167.424 167.424 0 0 0-38.4-38.4 173.568 173.568 0 0 0-43.008-28.16l-9.216-4.096a494.08 494.08 0 0 0-51.2-17.408 358.4 358.4 0 0 0-37.888-3.072 216.576 216.576 0 0 0-76.8 7.68l-20.992 7.168a239.104 239.104 0 0 0-51.2 26.112 1382.4 1382.4 0 0 0-108.544 92.672q-95.744 88.576-192.512 176.128l-37.376 34.816-16.896 16.384h-34.304c-18.944 0-42.496 0-51.2-4.096a138.24 138.24 0 0 1-112.128-97.28 185.344 185.344 0 0 1 0-67.072 150.528 150.528 0 0 1 47.616-71.68 168.448 168.448 0 0 1 93.696-33.28 179.712 179.712 0 0 1 114.176 51.2l22.528 18.944 22.528 18.944a59.904 59.904 0 0 0 15.36 11.264c3.584 0 11.776-6.656 40.96-33.28a197.12 197.12 0 0 0 25.088-26.112 109.056 109.056 0 0 0-17.408-19.456l-23.552-19.456c-3.584-4.096-40.448-32.256-59.392-46.08a256 256 0 0 0-64-31.744 70.656 70.656 0 0 1-18.944-8.704 228.864 228.864 0 0 1 17.92-51.2 239.104 239.104 0 0 1 51.2-64 216.064 216.064 0 0 1 83.968-44.032L468.02176 256a173.056 173.056 0 0 1 44.032-4.096A171.52 171.52 0 0 1 563.25376 256a224.256 224.256 0 0 1 96.256 46.08A240.128 240.128 0 0 1 706.61376 358.4a150.016 150.016 0 0 0 10.24 15.36 64.512 64.512 0 0 0 14.848 0 370.688 370.688 0 0 1 45.056-4.096c35.84 0 36.864 0 29.184-15.36a123.904 123.904 0 0 1-6.656-14.848 75.264 75.264 0 0 0-7.168-14.848 81.92 81.92 0 0 1-5.632-9.728 364.544 364.544 0 0 0-40.448-51.2 320 320 0 0 0-90.112-64l-23.04-10.752a310.272 310.272 0 0 0-37.376-11.776 354.816 354.816 0 0 0-130.56-8.192z m350.208 338.944a139.776 139.776 0 0 1 80.896 45.568 115.2 115.2 0 0 1 32.768 84.48 82.944 82.944 0 0 1-4.608 40.448 124.928 124.928 0 0 1-24.064 45.568 147.456 147.456 0 0 1-76.288 47.104 406.528 406.528 0 0 1-41.984 4.608H434.74176a563.2 563.2 0 0 1 48.64-47.104L545.84576 665.6c22.016-20.48 107.008-97.792 119.296-108.032l12.8-11.776a245.76 245.76 0 0 1 43.008-29.184 177.152 177.152 0 0 1 26.112-10.24l17.408-5.12a199.68 199.68 0 0 1 51.2 0z m0 0" fill="#3E4055" p-id="7698"></path></svg>`,
    godaddy: `<svg t="1742607673992" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14038" width="24" height="24"><path d="M683.52 924.16c69.4272-32.9216 165.7856-91.5456 245.76-194.56 20.2752-26.112 37.1712-52.0192 51.2-76.8 12.6976-31.488 27.8016-76.8512 35.84-133.12 18.2784-127.5392-12.3904-222.3104-20.48-245.76-12.9024-37.376-29.8496-80.896-71.68-122.88-65.4336-65.7408-145.2544-78.4896-168.96-81.92-57.9072-8.3968-103.3216 2.1504-138.24 10.24-23.808 5.5296-67.9424 16.128-117.76 46.08-39.5776 23.808-64.512 48.8448-81.92 66.56-48.4864 49.3568-73.2672 95.2832-107.52 158.72-20.2752 37.5808-37.5808 70.0416-51.2 117.76-2.6112 9.1648-9.0112 32.6144-15.36 76.8-5.9904 41.8816-11.8272 101.3248-10.1376 175.104-49.92-82.2272-79.4624-154.112-97.3824-205.824-15.872-45.8752-22.1696-74.8032-25.6-102.4-7.0656-56.9856-13.6704-110.2848 15.36-158.72 38.8096-64.7168 116.1728-79.0528 138.8544-83.2512 95.1808-17.6128 170.0352 29.6448 188.8256 42.2912 27.2896-23.9104 54.6304-47.7696 81.92-71.68-31.8976-24.9344-89.2928-62.208-168.96-76.8-17.152-3.1232-57.6512-9.3184-109.2096-3.8912-39.4752 4.1472-96.9216 9.9328-151.9104 49.9712-11.9296 8.6528-46.0288 35.1744-71.68 81.92-39.1168 71.2704-33.024 142.9504-25.6 230.4 3.7376 44.1856 10.4448 79.8208 15.36 102.4 34.7136 125.6448 86.3744 210.6368 122.88 261.12 29.0304 40.0896 51.2512 62.1568 58.0096 68.7616 27.6992 26.9824 95.0272 90.9824 203.1104 115.5584 31.7952 7.2192 98.4064 21.5552 179.2512-1.4336 27.0848-7.68 99.6864-29.3888 155.8528-96.4608 76.4928-91.392 68.9152-202.8544 64.256-270.6944-4.864-71.4752-24.5248-115.0464-30.72-128-20.7872-43.5712-47.616-73.8816-66.56-92.16-80.2304 32.4096-160.4096 64.8704-240.64 97.28l34.56 86.4768 165.12-71.1168c13.8752 24.0128 34.2016 67.1232 35.84 122.88 2.6624 92.2112-46.3872 203.264-143.36 240.64-50.8416 19.6096-131.584 25.344-179.2-20.48-28.416-27.3408-33.1776-61.696-40.96-117.76-3.8912-28.2112-12.9536-111.104 15.36-215.04 10.2912-37.7344 35.0208-113.3056 92.16-189.44 33.2288-44.288 63.0784-69.632 71.68-76.8 27.5456-22.8864 57.344-47.616 101.0176-61.184 16.9984-5.2736 99.2768-28.5184 178.5344 18.0224 67.3792 39.5264 90.368 104.704 99.328 130.2016 13.6704 38.8096 14.592 70.8608 15.36 97.28 0.768 26.5728 1.9456 85.0432-25.6 153.6-23.8592 59.392-58.5728 99.84-81.92 122.88-40.96 75.0592-81.92 150.1184-122.88 225.2288z" fill="#13EAE4" p-id="14039"></path></svg>`,
    namecheap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L2 7 L12 12 L22 7 Z" /><path d="M2 17 L12 22 L22 17" /><path d="M2 12 L12 17 L22 12" /></svg>`,
    huawei: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c7000b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>`,
  },
}

// 创建上下文，提供默认值避免null检查
const SiteContext = createContext<SiteContextType>({
  settings: DEFAULT_SETTINGS,
  updateSiteName: () => {},
  updateLogoType: () => {},
  updateLogoImage: () => {},
  updateLogoText: () => {},
  updateFavicon: () => {},
  addRegistrarIcon: () => {},
  updateRegistrarIcon: () => {},
  removeRegistrarIcon: () => {},
  resetSettings: () => {},
})

// 本地存储键
const SITE_SETTINGS_KEY = "domain-display-site-settings-v2"

// 从本地存储获取设置
function getSettingsFromStorage(): SiteSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS
  }

  try {
    const storedSettings = localStorage.getItem(SITE_SETTINGS_KEY)
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings)
      console.log("成功从localStorage读取设置:", parsedSettings)
      // 合并默认设置，确保结构完整
      return { ...DEFAULT_SETTINGS, ...parsedSettings }
    }
  } catch (error) {
    console.error("从localStorage读取设置失败:", error)
  }

  return DEFAULT_SETTINGS
}

// 保存设置到本地存储
function saveSettingsToStorage(settings: SiteSettings): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const settingsString = JSON.stringify(settings)
    localStorage.setItem(SITE_SETTINGS_KEY, settingsString)
    console.log("成功保存设置到localStorage:", settings)
    
    // 验证保存是否成功
    const savedSettings = localStorage.getItem(SITE_SETTINGS_KEY)
    if (!savedSettings) {
      console.error("保存验证失败，未找到保存的数据")
      return false
    }
    
    return true
  } catch (error) {
    console.error("保存设置到localStorage失败:", error)
    return false
  }
}

// 直接应用设置到文档
function applySettingsToDocument(settings: SiteSettings): void {
  if (typeof window === "undefined" || !document) {
    return
  }

  try {
    // 更新文档标题
    document.title = settings.siteName

    // 更新favicon
    const existingFavicon = document.querySelector('link[rel="icon"]')
    if (existingFavicon && settings.favicon) {
      existingFavicon.setAttribute('href', settings.favicon)
    } else if (settings.favicon) {
      const newFavicon = document.createElement('link')
      newFavicon.rel = 'icon'
      newFavicon.href = settings.favicon
      document.head.appendChild(newFavicon)
    }

    // 更新apple-touch-icon
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]')
    if (existingAppleIcon && settings.favicon) {
      existingAppleIcon.setAttribute('href', settings.favicon)
    } else if (settings.favicon) {
      const newAppleIcon = document.createElement('link')
      newAppleIcon.rel = 'apple-touch-icon'
      newAppleIcon.href = settings.favicon
      document.head.appendChild(newAppleIcon)
    }
    
    console.log("已直接应用设置到文档", settings)
  } catch (error) {
    console.error("应用设置到文档失败:", error)
  }
}

// 站点设置提供者组件
export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  // 初始化：从本地存储加载设置
  useEffect(() => {
    // 确保在客户端环境
    if (typeof window !== "undefined") {
      try {
        const storedSettings = getSettingsFromStorage()
        console.log("从存储加载初始设置")
        setSettings(storedSettings)
        
        // 立即应用设置到文档
        applySettingsToDocument(storedSettings)
      } catch (error) {
        console.error("加载设置时出错:", error)
        setSettings(DEFAULT_SETTINGS)
      }
    }
  }, [])

  // 标记设置状态已改变，通知其他组件更新
  const notifySettingsChanged = (updatedSettings: SiteSettings) => {
    if (typeof window !== "undefined" && document) {
      try {
        console.log("SiteContext发送设置更新事件", updatedSettings);
        
        // 创建自定义事件并触发
        const event = new CustomEvent('siteSettingsChanged', { 
          detail: updatedSettings
        });
        document.dispatchEvent(event);
        
        // 同时直接更新页面标题
        if (updatedSettings.siteName) {
          document.title = updatedSettings.siteName;
        }
      } catch (error) {
        console.error("发送设置事件失败:", error);
      }
    }
  }

  // 更新站点名称
  const updateSiteName = (name: string) => {
    const updatedSettings = { ...settings, siteName: name }
    setSettings(updatedSettings)
    
    // 保存并应用
    if (saveSettingsToStorage(updatedSettings)) {
      // 直接更新文档
      if (typeof window !== "undefined" && document) {
        document.title = name;
      }
      
      // 通知其他组件
      notifySettingsChanged(updatedSettings)
    }
  }

  // 更新Logo类型
  const updateLogoType = (type: "text" | "image") => {
    const updatedSettings = { ...settings, logoType: type }
    setSettings(updatedSettings)
    
    if (saveSettingsToStorage(updatedSettings)) {
      notifySettingsChanged(updatedSettings)
    }
  }

  // 更新Logo图片
  const updateLogoImage = (url: string) => {
    const updatedSettings = { ...settings, logoImage: url }
    setSettings(updatedSettings)
    
    if (saveSettingsToStorage(updatedSettings)) {
      notifySettingsChanged(updatedSettings)
    }
  }

  // 更新Logo文字
  const updateLogoText = (text: string) => {
    const updatedSettings = { ...settings, logoText: text }
    setSettings(updatedSettings)
    
    if (saveSettingsToStorage(updatedSettings)) {
      notifySettingsChanged(updatedSettings)
    }
  }

  // 更新Favicon
  const updateFavicon = (url: string) => {
    const updatedSettings = { ...settings, favicon: url }
    setSettings(updatedSettings)
    
    if (saveSettingsToStorage(updatedSettings)) {
      // 直接更新favicon
      if (typeof window !== "undefined" && document) {
        const existingFavicon = document.querySelector('link[rel="icon"]')
        if (existingFavicon) {
          existingFavicon.setAttribute('href', url)
        } else {
          const newFavicon = document.createElement('link')
          newFavicon.rel = 'icon'
          newFavicon.href = url
          document.head.appendChild(newFavicon)
        }
        
        // 更新apple-touch-icon
        const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]')
        if (existingAppleIcon) {
          existingAppleIcon.setAttribute('href', url)
        } else {
          const newAppleIcon = document.createElement('link')
          newAppleIcon.rel = 'apple-touch-icon'
          newAppleIcon.href = url
          document.head.appendChild(newAppleIcon)
        }
      }
      
      notifySettingsChanged(updatedSettings)
    }
  }

  // 添加注册商图标
  const addRegistrarIcon = (name: string, svg: string) => {
    if (!name.trim() || !svg.trim()) return

    const updatedIcons = { ...settings.registrarIcons, [name]: svg }
    const updatedSettings = { ...settings, registrarIcons: updatedIcons }
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    notifySettingsChanged(updatedSettings)
  }

  // 更新注册商图标
  const updateRegistrarIcon = (name: string, svg: string) => {
    if (!name.trim() || !svg.trim() || !settings.registrarIcons[name]) return

    const updatedIcons = { ...settings.registrarIcons, [name]: svg }
    const updatedSettings = { ...settings, registrarIcons: updatedIcons }
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    notifySettingsChanged(updatedSettings)
  }

  // 删除注册商图标
  const removeRegistrarIcon = (name: string) => {
    if (!settings.registrarIcons[name]) return

    const updatedIcons = { ...settings.registrarIcons }
    delete updatedIcons[name]
    const updatedSettings = { ...settings, registrarIcons: updatedIcons }
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    notifySettingsChanged(updatedSettings)
  }

  // 重置设置为默认值
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    
    // 清除本地存储
    if (typeof window !== "undefined") {
      try {
        // 清除所有可能的旧版存储
        localStorage.removeItem(SITE_SETTINGS_KEY)
        localStorage.removeItem("domain-display-site-settings")
        localStorage.removeItem("site_settings")
        
        // 重新保存默认设置
        saveSettingsToStorage(DEFAULT_SETTINGS)
        
        console.log("已重置设置为默认值")
        notifySettingsChanged(DEFAULT_SETTINGS)
      } catch (error) {
        console.error("重置设置时出错:", error)
      }
    }
  }

  const contextValue: SiteContextType = {
    settings,
    updateSiteName,
    updateLogoType,
    updateLogoImage,
    updateLogoText,
    updateFavicon,
    addRegistrarIcon,
    updateRegistrarIcon,
    removeRegistrarIcon,
    resetSettings,
  }

  return <SiteContext.Provider value={contextValue}>{children}</SiteContext.Provider>
}

// 使用站点上下文的钩子
export function useSite() {
  return useContext(SiteContext)
}

