"use client"

import { useEffect } from "react"
import { useSite } from "@/contexts/site-context"

export function SiteMetadata() {
  const { settings } = useSite()

  // 在客户端渲染后设置元数据
  useEffect(() => {
    try {
      // 更新页面标题
      if (settings.siteName) {
        document.title = settings.siteName
        console.log("已更新页面标题:", settings.siteName)
      }

      // 更新网站图标
      if (settings.favicon) {
        const existingFavicon = document.querySelector('link[rel="icon"]')

        if (existingFavicon) {
          // 如果存在，更新 href
          (existingFavicon as HTMLLinkElement).href = settings.favicon
        } else {
          // 如果不存在，创建新的
          const newFavicon = document.createElement("link")
          newFavicon.setAttribute("rel", "icon")
          newFavicon.setAttribute("href", settings.favicon)
          document.head.appendChild(newFavicon)
        }

        // 更新apple-touch-icon
        const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]')
        if (existingAppleIcon) {
          // 如果存在，更新href
          existingAppleIcon.setAttribute("href", settings.favicon)
        } else {
          // 如果不存在，创建新的
          const newAppleIcon = document.createElement("link")
          newAppleIcon.setAttribute("rel", "apple-touch-icon")
          newAppleIcon.setAttribute("href", settings.favicon)
          document.head.appendChild(newAppleIcon)
        }

        console.log("已更新网站图标:", settings.favicon)
      }
    } catch (error) {
      console.error("更新网站元数据失败:", error)
    }
  }, [settings])

  // 这个组件不渲染任何内容
  return null
}

