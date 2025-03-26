"use client"

import Link from "next/link"
import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSite } from "@/contexts/site-context"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

export function MainNav() {
  const { user } = useAuth()
  const { settings } = useSite()
  const [logoType, setLogoType] = useState<"text" | "image">(settings.logoType)
  const [logoText, setLogoText] = useState(settings.logoText || "域名展示")
  const [logoImage, setLogoImage] = useState(settings.logoImage || "/placeholder.svg")
  const [siteName, setSiteName] = useState(settings.siteName)
  const [imageKey, setImageKey] = useState(Date.now()) // 添加key来强制重新渲染图片
  const [mounted, setMounted] = useState(false)
  const logoRef = useRef<HTMLImageElement>(null)
  
  // 重新加载Logo图片的函数
  const reloadImage = useCallback(() => {
    if (logoRef.current && logoType === "image" && logoImage) {
      const timestamp = Date.now();
      // 生成新的key强制React重新渲染图片
      setImageKey(timestamp);
      // 添加随机时间戳强制刷新图片缓存
      logoRef.current.src = `${logoImage}?t=${timestamp}`;
      console.log("重新加载Logo图片:", logoImage, timestamp);
    }
  }, [logoType, logoImage]);

  // 初始化：从上下文更新本地状态
  useEffect(() => {
    console.log("MainNav从context加载设置", settings);
    
    // 从上下文更新本地状态
    if(settings) {
      setLogoType(settings.logoType);
      setLogoText(settings.logoText || "域名展示");
      setLogoImage(settings.logoImage || "/placeholder.svg");
      setSiteName(settings.siteName);
      
      // 首次加载后标记为已挂载
      if (!mounted) {
        setMounted(true);
        // 首次加载后尝试重新加载图片
        setTimeout(reloadImage, 100);
      }
    }
  }, [settings, mounted, reloadImage]);
  
  // 设置自定义事件监听器
  useEffect(() => {
    // 定义事件处理函数
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('MainNav收到设置更新事件:', customEvent.detail);
      
      if(!customEvent.detail) return;
      
      const { 
        logoType: newLogoType, 
        logoText: newLogoText, 
        logoImage: newLogoImage, 
        siteName: newSiteName 
      } = customEvent.detail;
      
      // 更新本地状态，只有当新值存在且不同时才更新
      if (newLogoType && newLogoType !== logoType) {
        setLogoType(newLogoType);
        console.log("更新logoType:", newLogoType);
      }
      
      if (newLogoText && newLogoText !== logoText) {
        setLogoText(newLogoText);
        console.log("更新logoText:", newLogoText);
      }
      
      if (newSiteName && newSiteName !== siteName) {
        setSiteName(newSiteName);
        console.log("更新siteName:", newSiteName);
      }
      
      if (newLogoImage && newLogoImage !== logoImage) {
        setLogoImage(newLogoImage);
        console.log("更新logoImage:", newLogoImage);
        // 强制重新加载图片，增加延迟确保状态更新完成
        setTimeout(reloadImage, 50);
      }
    };
    
    // 添加事件监听器
    document.addEventListener('siteSettingsChanged', handleSettingsChange);
    
    // 清理函数
    return () => {
      document.removeEventListener('siteSettingsChanged', handleSettingsChange);
    };
  }, [logoType, logoText, logoImage, siteName, reloadImage]); // 依赖项数组包含所有使用的状态

  // 处理图片加载错误
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    console.error("Logo图片加载失败:", target.src);
    target.src = "/placeholder.svg";
  }

  if (!mounted) {
    // 首次渲染时显示占位内容
    return (
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <div className="h-8 w-32 bg-gray-100 animate-pulse rounded"></div>
          <div className="ml-auto">
            <div className="h-9 w-16 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center">
          {logoType === "text" ? (
            <span className="font-bold text-xl">{logoText || "域名展示"}</span>
          ) : (
            <img
              ref={logoRef}
              src={logoImage || "/placeholder.svg"} 
              alt={siteName}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              onError={handleImageError}
              key={`logo-${logoImage}-${imageKey}`}
              style={{ maxWidth: '200px' }}
              onLoad={(e) => console.log("Logo图片加载成功:", (e.target as HTMLImageElement).src)}
            />
          )}
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {user?.isLoggedIn ? (
            <UserMenu />
          ) : (
            <Button asChild>
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

