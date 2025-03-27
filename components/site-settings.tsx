"use client"

import { useState, useEffect, useCallback } from "react"
import { useSite } from "@/contexts/site-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, Loader2, RotateCcw, Save, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import DatabaseManager from "@/components/database-manager"

// 默认设置，用于初始化和重置
const DEFAULT_SITE_SETTINGS = {
  siteName: "域名展示",
  logoType: "text" as const,
  logoText: "域名展示",
  logoImage: "",
  favicon: "https://xn--1xa.team/img/favicon.ico",
  registrarIcons: {}
}

export default function SiteSettings() {
  // 获取站点上下文
  const { settings, updateSiteName, updateLogoType, updateLogoText, updateLogoImage, updateFavicon, resetSettings } = useSite()
  const { toast } = useToast()
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState("基本设置")
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    siteName: settings?.siteName || DEFAULT_SITE_SETTINGS.siteName,
    logoType: settings?.logoType || DEFAULT_SITE_SETTINGS.logoType,
    logoText: settings?.logoText || DEFAULT_SITE_SETTINGS.logoText,
    logoImage: settings?.logoImage || DEFAULT_SITE_SETTINGS.logoImage,
    favicon: settings?.favicon || DEFAULT_SITE_SETTINGS.favicon
  })

  // 用于清理成功状态的计时器
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [saveSuccess])

  // 当上下文中的设置变更时，同步更新表单
  useEffect(() => {
    if (settings) {
      console.log("检测到设置变更:", settings)
      setFormData({
        siteName: settings.siteName || DEFAULT_SITE_SETTINGS.siteName,
        logoType: settings.logoType || DEFAULT_SITE_SETTINGS.logoType,
        logoText: settings.logoText || DEFAULT_SITE_SETTINGS.logoText,
        logoImage: settings.logoImage || DEFAULT_SITE_SETTINGS.logoImage,
        favicon: settings.favicon || DEFAULT_SITE_SETTINGS.favicon
      })
    }
  }, [settings])

  // 直接保存到localStorage的辅助函数
  const saveDirectlyToLocalStorage = useCallback((data: any) => {
    try {
      if (typeof window !== 'undefined') {
        // 获取当前存储的所有设置
        const currentStoredString = localStorage.getItem("domain-display-site-settings")
        let currentStored = DEFAULT_SITE_SETTINGS
        
        if (currentStoredString) {
          try {
            currentStored = JSON.parse(currentStoredString)
          } catch (e) {
            console.error("解析已存储设置失败:", e)
          }
        }
        
        // 合并新数据
        const merged = { 
          ...currentStored, 
          ...data,
          // 确保registrarIcons不会丢失
          registrarIcons: (currentStored.registrarIcons || {})
        }
        
        // 强制确保siteName在合并中
        if (data.siteName) {
          merged.siteName = data.siteName
        }
        
        // 保存回localStorage
        localStorage.setItem("domain-display-site-settings", JSON.stringify(merged))
        console.log("✅ 成功保存到localStorage:", merged)
        
        // 额外调试 - 立即重新读取验证
        const verifyStorage = localStorage.getItem("domain-display-site-settings")
        if (verifyStorage) {
          const verifyData = JSON.parse(verifyStorage)
          console.log("✓ 验证存储结果:", verifyData)
          // 专门检查siteName
          if (data.siteName && data.siteName !== verifyData.siteName) {
            console.error("⚠️ 网站名称保存验证失败:", {
              expected: data.siteName,
              actual: verifyData.siteName
            })
          }
        }
        
        return true
      }
      return false
    } catch (err) {
      console.error("❌ 直接保存到localStorage失败:", err)
      return false
    }
  }, [])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSaveSuccess(false)

    try {
      console.log("提交表单数据:", formData)
      
      // 第一步：确保siteName非空
      const siteName = formData.siteName.trim() || DEFAULT_SITE_SETTINGS.siteName
      console.log("🔍 处理网站名称:", siteName)
      
      // 准备提交数据
      const dataToSave = {
        siteName: siteName,
        logoType: formData.logoType || DEFAULT_SITE_SETTINGS.logoType,
        logoText: formData.logoType === "text" ? 
          (formData.logoText || DEFAULT_SITE_SETTINGS.logoText) : settings?.logoText,
        logoImage: formData.logoType === "image" ? 
          (formData.logoImage || DEFAULT_SITE_SETTINGS.logoImage) : settings?.logoImage,
        favicon: formData.favicon || DEFAULT_SITE_SETTINGS.favicon
      }
      
      console.log("📤 准备保存数据:", dataToSave)
      
      // 首先直接更新上下文
      console.log("🔄 更新站点名称到上下文:", siteName)
      updateSiteName(siteName)
      
      // 更新其他设置
      updateLogoType(dataToSave.logoType as "text" | "image")
      
      if (dataToSave.logoType === "text" && dataToSave.logoText) {
        updateLogoText(dataToSave.logoText)
      } else if (dataToSave.logoType === "image" && dataToSave.logoImage) {
        updateLogoImage(dataToSave.logoImage)
      }
      
      updateFavicon(dataToSave.favicon)
      
      // 然后直接保存到localStorage
      console.log("💾 保存数据到localStorage")
      const savedDirectly = saveDirectlyToLocalStorage(dataToSave)
      if (!savedDirectly) {
        throw new Error("无法直接保存到localStorage")
      }
      
      // 强制更新文档标题
      if (typeof document !== 'undefined') {
        document.title = siteName
        console.log("📑 强制更新文档标题:", siteName)
      }
      
      // 设置成功状态
      setSaveSuccess(true)
      toast({
        title: "设置已保存",
        description: "您的网站设置已成功更新。",
      })
    } catch (error) {
      console.error("保存设置失败:", error)
      setError(error instanceof Error ? error.message : "保存设置时发生未知错误")
      toast({
        title: "保存失败",
        description: "保存设置时发生错误，请重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 重置设置
  const handleReset = () => {
    setIsResetting(true)
    setError(null)
    setSaveSuccess(false)
    
    try {
      console.log("重置设置")
      
      // 首先直接保存默认设置到localStorage
      const savedDirectly = saveDirectlyToLocalStorage({
        siteName: DEFAULT_SITE_SETTINGS.siteName,
        logoType: DEFAULT_SITE_SETTINGS.logoType,
        logoText: DEFAULT_SITE_SETTINGS.logoText,
        logoImage: DEFAULT_SITE_SETTINGS.logoImage,
        favicon: DEFAULT_SITE_SETTINGS.favicon
      })
      
      if (!savedDirectly) {
        throw new Error("无法直接保存默认设置到localStorage")
      }
      
      // 然后重置上下文
      resetSettings()
      
      // 更新表单数据
      setFormData({
        siteName: DEFAULT_SITE_SETTINGS.siteName,
        logoType: DEFAULT_SITE_SETTINGS.logoType,
        logoText: DEFAULT_SITE_SETTINGS.logoText,
        logoImage: DEFAULT_SITE_SETTINGS.logoImage,
        favicon: DEFAULT_SITE_SETTINGS.favicon
      })
      
      // 设置成功状态
      setSaveSuccess(true)
      toast({
        title: "设置已重置",
        description: "已将所有设置恢复为默认值。",
      })
    } catch (error) {
      console.error("重置设置失败:", error)
      setError(error instanceof Error ? error.message : "重置设置时发生未知错误")
      toast({
        title: "重置失败",
        description: "重置设置时发生错误，请重试。",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  // 刷新页面
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      try {
        // 先强制将当前设置从localStorage加载到sessionStorage
        // 这样刷新页面时能确保使用最新设置
        const currentData = localStorage.getItem("domain-display-site-settings")
        if (currentData) {
          sessionStorage.setItem("temp_site_settings", currentData)
          console.log("📦 已将设置临时保存到sessionStorage")
        }
        
        // 添加reload_settings参数强制重新加载设置
        console.log("🔄 正在刷新页面...")
        window.location.href = window.location.pathname + '?reload_settings=true&ts=' + new Date().getTime()
      } catch (error) {
        console.error("❌ 刷新页面时出错:", error)
        // 简单刷新
        window.location.reload()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* 成功提示 */}
      {saveSuccess && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>设置已成功保存</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="基本设置">基本设置</TabsTrigger>
          <TabsTrigger value="网站图标">网站图标</TabsTrigger>
          <TabsTrigger value="数据存储">数据存储</TabsTrigger>
        </TabsList>
        
        <TabsContent value="基本设置" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="siteName">网站名称</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="请输入网站名称"
                  className="mt-1"
                />
              </div>

              {/* Logo设置区块 */}
              <div className="space-y-4 border rounded-md p-4 bg-gray-50/50">
                <h3 className="text-lg font-medium">左上角Logo设置</h3>
                
                <div>
                  <Label>Logo 显示方式</Label>
                  <RadioGroup
                    value={formData.logoType}
                    onValueChange={(value) => setFormData({ ...formData, logoType: value as "text" | "image" })}
                    className="flex flex-col space-y-1 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" />
                      <Label htmlFor="text">文字</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image">图片</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.logoType === "text" ? (
                  <div>
                    <Label htmlFor="logoText">Logo 文字</Label>
                    <Input
                      id="logoText"
                      value={formData.logoText}
                      onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                      placeholder="请输入Logo文字"
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="logoImage">Logo 图片URL</Label>
                    <Input
                      id="logoImage"
                      value={formData.logoImage}
                      onChange={(e) => setFormData({ ...formData, logoImage: e.target.value })}
                      placeholder="请输入Logo图片URL"
                      className="mt-1"
                    />
                    {formData.logoImage && (
                      <div className="mt-2 flex justify-center p-2 border rounded-md bg-white">
                        <img 
                          src={formData.logoImage} 
                          alt="Logo预览" 
                          className="max-h-16 object-contain"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Logo实时预览 */}
                <div className="mt-4">
                  <Label>Logo预览(左上角显示效果)</Label>
                  <div className="mt-2 p-3 border rounded-md bg-white flex items-center">
                    {formData.logoType === "image" && formData.logoImage ? (
                      <div className="h-8 w-auto">
                        <img
                          src={formData.logoImage}
                          alt={formData.siteName}
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-red-500 text-xs">图片加载失败</span>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-xl">{formData.logoText || formData.siteName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存设置
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isResetting} 
                onClick={handleReset}
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="网站图标" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="favicon">网站图标URL</Label>
                <Input
                  id="favicon"
                  value={formData.favicon}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                  placeholder="请输入网站图标URL（favicon）"
                  className="mt-1"
                />
                {formData.favicon && (
                  <div className="mt-2 flex justify-center p-2 border rounded-md">
                    <img 
                      src={formData.favicon} 
                      alt="Favicon预览" 
                      className="max-h-12 object-contain"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存设置
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isResetting} 
                onClick={handleReset}
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="数据存储" className="mt-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p>您可以将所有数据（包括密码、域名、设置等）保存到SQLite数据库中，确保数据安全存储。</p>
            </div>
            <DatabaseManager />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* 刷新提示 */}
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          onClick={handleReload}
          className="text-sm"
        >
          刷新页面以查看更改
        </Button>
      </div>
    </div>
  )
}

