"use client"

import { useEffect } from "react"
import { useSite } from "@/contexts/site-context"

export function SiteMetadata() {
  const { settings } = useSite()

  // 在客户端渲染后设置元数据
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    try {
      // 更新页面标题
      if (settings.siteName) {
        document.title = settings.siteName;
        console.log("🔄 已更新页面标题:", settings.siteName);
        
        // 更新或创建meta标签
        let metaTitle = document.querySelector('meta[name="title"]');
        if (metaTitle) {
          metaTitle.setAttribute('content', settings.siteName);
        } else {
          metaTitle = document.createElement('meta');
          metaTitle.setAttribute('name', 'title');
          metaTitle.setAttribute('content', settings.siteName);
          document.head.appendChild(metaTitle);
        }
      }

      // 更新网站图标
      if (settings.favicon) {
        // 更新图标函数
        const updateFavicon = () => {
          // 处理标准图标
          let favicon = document.querySelector('link[rel="icon"]');
          if (favicon) {
            favicon.setAttribute('href', settings.favicon);
          } else {
            favicon = document.createElement('link');
            favicon.setAttribute('rel', 'icon');
            favicon.setAttribute('href', settings.favicon);
            document.head.appendChild(favicon);
          }
          
          // 处理Apple图标
          let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (appleIcon) {
            appleIcon.setAttribute('href', settings.favicon);
          } else {
            appleIcon = document.createElement('link');
            appleIcon.setAttribute('rel', 'apple-touch-icon');
            appleIcon.setAttribute('href', settings.favicon);
            document.head.appendChild(appleIcon);
          }
          
          console.log("🔄 已更新网站图标:", settings.favicon);
        };

        updateFavicon();
      }
    } catch (error) {
      console.error("❌ 更新网站元数据失败:", error);
    }
  }, [settings]);

  // 这个组件不渲染任何内容
  return null
}

