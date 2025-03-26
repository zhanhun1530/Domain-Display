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
  registrarNames: {
    [key: string]: string
  }
  siteDescription: string
  siteKeywords: string
  siteLogo: string
  siteFavicon: string
}

// 定义站点上下文类型
interface SiteContextType {
  settings: SiteSettings
  updateSiteName: (name: string) => void
  updateLogoType: (type: "text" | "image") => void
  updateLogoImage: (url: string) => void
  updateLogoText: (text: string) => void
  updateFavicon: (url: string) => void
  addRegistrarIcon: (name: string, displayName: string, svg: string) => void
  updateRegistrarIcon: (name: string, displayName: string, svg: string) => void
  removeRegistrarIcon: (name: string) => void
  resetSettings: () => void
  updateSettings: (settings: Partial<SiteSettings>) => void
  securityQuestion: string
  securityAnswer: string
  setSecurityQuestion: (question: string) => void
  setSecurityAnswer: (answer: string) => void
  verifySecurityAnswer: (answer: string) => boolean
}

// 默认设置
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "域名展示",
  logoType: "text",
  logoText: "域名展示",
  favicon: "https://xn--1xa.team/img/favicon.ico",
  registrarIcons: {
    aliyun: `<svg t="1742606538431" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3384" width="24" height="24"><path d="M0 0h1024v1024H0z" fill="#FFFFFF" p-id="3385"></path><path d="M362.752 476.864h298.496v67.328H362.752z" fill="#FF8F00" p-id="3386"></path><path d="M810.816 232.64H613.312l47.68 67.456 144 44.16a62.272 62.272 0 0 1 43.456 59.776V619.968a62.272 62.272 0 0 1-43.52 59.84l-144 44.096-47.616 67.456h197.504A149.184 149.184 0 0 0 960 642.176V381.824a149.184 149.184 0 0 0-149.184-149.12z m-597.632 0h197.504L363.008 300.16l-144 44.16a62.272 62.272 0 0 0-43.456 59.776V619.968a62.272 62.272 0 0 0 43.52 59.84l144 44.096 47.616 67.456H213.184A149.184 149.184 0 0 1 64 642.176V381.824a149.184 149.184 0 0 1 149.184-149.12z" fill="#FF8F00" p-id="3387"></path></svg>`,
    namecheap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L2 7 L12 12 L22 7 Z" /><path d="M2 17 L12 22 L22 17" /><path d="M2 12 L12 17 L22 12" /></svg>`,
    huawei: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c7000b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>`,
  },
  registrarNames: {
    aliyun: "阿里云",
    namecheap: "Namecheap",
    huawei: "华为云",
  },
  siteDescription: "优质域名交易平台",
  siteKeywords: "域名,域名交易,域名买卖",
  siteLogo: "",
  siteFavicon: "",
}

// 创建站点上下文
const SiteContext = createContext<SiteContextType | undefined>(undefined)

// 站点提供者组件
export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    // 从本地存储加载设置
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("siteSettings")
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return DEFAULT_SETTINGS
  })

  const [securityQuestion, setSecurityQuestion] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("securityQuestion") || "您的出生地是？"
    }
    return "您的出生地是？"
  })

  const [securityAnswer, setSecurityAnswer] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("securityAnswer") || ""
    }
    return ""
  })

  // 保存设置到本地存储
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteSettings", JSON.stringify(settings))
    }
  }, [settings])

  // 保存安全问题到本地存储
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("securityQuestion", securityQuestion)
    }
  }, [securityQuestion])

  // 保存安全问题答案到本地存储
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("securityAnswer", securityAnswer)
    }
  }, [securityAnswer])

  // 更新网站名称
  const updateSiteName = (name: string) => {
    setSettings((prev) => ({ ...prev, siteName: name }))
  }

  // 更新Logo类型
  const updateLogoType = (type: "text" | "image") => {
    setSettings((prev) => ({ ...prev, logoType: type }))
  }

  // 更新Logo图片
  const updateLogoImage = (url: string) => {
    setSettings((prev) => ({ ...prev, logoImage: url }))
  }

  // 更新Logo文本
  const updateLogoText = (text: string) => {
    setSettings((prev) => ({ ...prev, logoText: text }))
  }

  // 更新网站图标
  const updateFavicon = (url: string) => {
    setSettings((prev) => ({ ...prev, favicon: url }))
  }

  // 添加注册商图标
  const addRegistrarIcon = (name: string, displayName: string, svg: string) => {
    setSettings((prev) => ({
      ...prev,
      registrarIcons: {
        ...prev.registrarIcons,
        [name]: svg,
      },
      registrarNames: {
        ...prev.registrarNames,
        [name]: displayName,
      },
    }))
  }

  // 更新注册商图标
  const updateRegistrarIcon = (name: string, displayName: string, svg: string) => {
    setSettings((prev) => ({
      ...prev,
      registrarIcons: {
        ...prev.registrarIcons,
        [name]: svg,
      },
      registrarNames: {
        ...prev.registrarNames,
        [name]: displayName,
      },
    }))
  }

  // 删除注册商图标
  const removeRegistrarIcon = (name: string) => {
    setSettings((prev) => {
      const newRegistrarIcons = { ...prev.registrarIcons }
      const newRegistrarNames = { ...prev.registrarNames }
      delete newRegistrarIcons[name]
      delete newRegistrarNames[name]
      return {
        ...prev,
        registrarIcons: newRegistrarIcons,
        registrarNames: newRegistrarNames,
      }
    })
  }

  // 重置所有设置
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  // 更新部分设置
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // 验证安全问题答案
  const verifySecurityAnswer = (answer: string) => {
    return answer === securityAnswer
  }

  return (
    <SiteContext.Provider
      value={{
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
        updateSettings,
        securityQuestion,
        securityAnswer,
        setSecurityQuestion,
        setSecurityAnswer,
        verifySecurityAnswer,
      }}
    >
      {children}
    </SiteContext.Provider>
  )
}

// 使用站点上下文的自定义Hook
export function useSite() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider")
  }
  return context
}

