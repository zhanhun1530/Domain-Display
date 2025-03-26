"use client"

import { useEffect, useState } from "react"
import { useSite } from "@/contexts/site-context"
import Head from "next/head"

export function SiteMetadata() {
  const { settings } = useSite()
  const [mounted, setMounted] = useState(false)

  // 一旦组件挂载，立即应用设置
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
  }, []);

  // 当设置变化时更新元数据
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    try {
      console.log("SiteMetadata: 应用设置到文档", settings);
      
      // 更新页面标题
      if (settings.siteName) {
        document.title = settings.siteName;
      }
      
      // 更新favicon
      if (settings.favicon) {
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
          existingFavicon.setAttribute('href', settings.favicon);
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = settings.favicon;
          document.head.appendChild(newFavicon);
        }
        
        // 更新apple-touch-icon
        const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        if (existingAppleIcon) {
          existingAppleIcon.setAttribute('href', settings.favicon);
        } else {
          const newAppleIcon = document.createElement('link');
          newAppleIcon.rel = 'apple-touch-icon';
          newAppleIcon.href = settings.favicon;
          document.head.appendChild(newAppleIcon);
        }
      }
    } catch (error) {
      console.error("SiteMetadata: 应用设置到文档失败", error);
    }
  }, [settings, mounted]);

  // 监听设置变更事件
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    const handleSettingsChange = (e: Event) => {
      try {
        const customEvent = e as CustomEvent;
        if (!customEvent.detail) return;
        
        const { siteName, favicon } = customEvent.detail;
        console.log("SiteMetadata收到设置更新事件:", { siteName, favicon });
        
        // 动态更新文档标题
        if (siteName && document) {
          document.title = siteName;
        }
        
        // 动态更新favicon
        if (favicon && document) {
          // 更新favicon
          const existingFavicon = document.querySelector('link[rel="icon"]');
          if (existingFavicon) {
            existingFavicon.setAttribute('href', favicon);
          } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = favicon;
            document.head.appendChild(newFavicon);
          }
          
          // 更新apple-touch-icon
          const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (existingAppleIcon) {
            existingAppleIcon.setAttribute('href', favicon);
          } else {
            const newAppleIcon = document.createElement('link');
            newAppleIcon.rel = 'apple-touch-icon';
            newAppleIcon.href = favicon;
            document.head.appendChild(newAppleIcon);
          }
        }
      } catch (error) {
        console.error("应用元数据更新失败:", error);
      }
    };
    
    // 添加事件监听器
    document.addEventListener('siteSettingsChanged', handleSettingsChange);
    
    // 清理函数
    return () => {
      document.removeEventListener('siteSettingsChanged', handleSettingsChange);
    };
  }, [mounted]);

  // 不要返回任何可见的DOM元素，因为这个组件位于<html>标签内
  return null;
}

