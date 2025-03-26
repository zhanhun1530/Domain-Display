"use client"

import { useState, useEffect } from "react"
import { useSite } from "@/contexts/site-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SiteSettings() {
  const {
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
  } = useSite()

  const [siteName, setSiteName] = useState(settings.siteName)
  const [logoType, setLogoType] = useState<"text" | "image">(settings.logoType)
  const [logoText, setLogoText] = useState(settings.logoText || "")
  const [logoImage, setLogoImage] = useState(settings.logoImage || "")
  const [favicon, setFavicon] = useState(settings.favicon)

  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // 当设置变更时，更新本地状态
  useEffect(() => {
    setSiteName(settings.siteName)
    setLogoType(settings.logoType)
    setLogoText(settings.logoText || "")
    setLogoImage(settings.logoImage || "")
    setFavicon(settings.favicon)
  }, [settings])

  // 立即应用设置到当前页面，无需刷新
  const applySettingsToCurrentPage = () => {
    try {
      if (typeof window !== "undefined" && document) {
        // 更新文档标题
        const trimmedSiteName = siteName.trim();
        if (trimmedSiteName) {
          document.title = trimmedSiteName;
        }
        
        // 更新favicon
        const trimmedFavicon = favicon.trim();
        if (trimmedFavicon) {
          const existingFavicon = document.querySelector('link[rel="icon"]');
          if (existingFavicon) {
            existingFavicon.setAttribute('href', trimmedFavicon);
          } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = trimmedFavicon;
            document.head.appendChild(newFavicon);
          }
          
          // 更新apple-touch-icon
          const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (existingAppleIcon) {
            existingAppleIcon.setAttribute('href', trimmedFavicon);
          } else {
            const newAppleIcon = document.createElement('link');
            newAppleIcon.rel = 'apple-touch-icon';
            newAppleIcon.href = trimmedFavicon;
            document.head.appendChild(newAppleIcon);
          }
        }
        
        // 构造完整的设置对象
        const updatedSettings = {
          siteName: trimmedSiteName || settings.siteName,
          logoType,
          logoText: logoText.trim() || "域名展示",
          logoImage: logoImage.trim() || "/placeholder.svg",
          favicon: trimmedFavicon || settings.favicon,
          registrarIcons: settings.registrarIcons
        };
        
        // 主动触发更新事件
        console.log("正在发送设置更新事件:", updatedSettings);
        
        try {
          // 创建自定义事件并触发
          const event = new CustomEvent('siteSettingsChanged', { 
            detail: updatedSettings
          });
          document.dispatchEvent(event);
          console.log("设置更新事件已发送");
          return true;
        } catch (err) {
          console.error("发送更新事件失败:", err);
          return false;
        }
      }
    } catch (error) {
      console.error("应用设置时出错:", error);
      return false;
    }
    return false;
  }

  // 保存并应用设置
  const saveAndApplySettings = () => {
    // 验证必填字段
    const trimmedSiteName = siteName.trim();
    const trimmedLogoText = logoText.trim();
    const trimmedLogoImage = logoImage.trim();
    
    if (!trimmedSiteName) {
      setMessage({ type: "error", text: "站点名称不能为空" });
      setTimeout(() => setMessage(null), 3000);
      return false;
    }
    
    if (logoType === "text" && !trimmedLogoText) {
      setMessage({ type: "error", text: "Logo文字不能为空" });
      setTimeout(() => setMessage(null), 3000);
      return false;
    }
    
    if (logoType === "image" && !trimmedLogoImage) {
      setMessage({ type: "error", text: "Logo图片URL不能为空" });
      setTimeout(() => setMessage(null), 3000);
      return false;
    }
    
    // 跟踪哪些设置已更改
    let changes = [];
    
    // 更新设置(只更新已更改的设置)
    if (trimmedSiteName !== settings.siteName) {
      updateSiteName(trimmedSiteName);
      changes.push("站点名称");
    }

    if (logoType !== settings.logoType) {
      updateLogoType(logoType);
      changes.push("Logo类型");
    }
    
    if (logoType === "text" && trimmedLogoText !== settings.logoText) {
      updateLogoText(trimmedLogoText);
      changes.push("Logo文字");
    }
    
    if (logoType === "image" && trimmedLogoImage !== settings.logoImage) {
      updateLogoImage(trimmedLogoImage);
      changes.push("Logo图片");
    }
    
    if (changes.length === 0) {
      setMessage({ type: "info", text: "没有检测到任何更改" });
      setTimeout(() => setMessage(null), 3000);
      return false;
    }
    
    return {
      success: true,
      changes: changes.join("、")
    };
  }

  // 保存基本设置
  const handleSaveBasicSettings = () => {
    try {
      // 使用公共方法保存设置
      const result = saveAndApplySettings();
      
      if (!result) return; // 验证失败
      
      // 尝试立即应用并显示相应的消息
      setTimeout(() => {
        const applied = applySettingsToCurrentPage();
        
        // 构建成功消息
        setMessage({ 
          type: "success", 
          text: `设置已保存${applied ? "并立即生效" : ""}(${result.changes})` 
        });
        
        setTimeout(() => setMessage(null), 5000);
      }, 100);
    } catch (error) {
      console.error("保存设置失败:", error);
      setMessage({ type: "error", text: "保存设置时出错，请稍后重试" });
      setTimeout(() => setMessage(null), 5000);
    }
  }
  
  // 处理保存并查看效果
  const handleSaveAndView = () => {
    // 显示处理中消息
    setMessage({ type: "info", text: "正在保存设置并应用..." });
    
    try {
      // 使用公共方法保存设置
      const result = saveAndApplySettings();
      
      if (!result) return; // 验证失败
      
      // 延迟确保设置已保存到上下文
      setTimeout(() => {
        try {
          // 立即应用设置到页面
          const applied = applySettingsToCurrentPage();
          
          // 给用户反馈
          setMessage({
            type: "success", 
            text: "设置已保存并成功应用，正在跳转到首页..."
          });
          
          console.log("准备跳转到首页，已应用设置:", result.changes);
          
          // 跳转前再次确保事件已被处理
          setTimeout(() => {
            // 强制刷新跳转到首页，确保从服务器重新加载
            window.location.href = "/?refresh=" + Date.now();
          }, 800);
        } catch (error) {
          console.error("应用设置失败:", error);
          setMessage({ 
            type: "error", 
            text: "应用设置时出错，请手动刷新页面" 
          });
        }
      }, 300);
    } catch (error) {
      console.error("保存设置失败:", error);
      setMessage({ 
        type: "error", 
        text: "保存设置时出错，请稍后重试" 
      });
    }
  }

  // 保存网站图标
  const handleSaveFavicon = () => {
    if (favicon.trim()) {
      if (favicon.trim() !== settings.favicon) {
        updateFavicon(favicon.trim())
        
        // 尝试立即应用设置
        const applied = applySettingsToCurrentPage();
        
        setMessage({ 
          type: "success", 
          text: `网站图标已保存${applied ? "并已立即应用到浏览器标签" : "，需要刷新页面才能看到完整效果"}` 
        })
      } else {
        setMessage({ type: "info", text: "网站图标未更改" })
      }
      setTimeout(() => setMessage(null), 5000)
    } else {
      setMessage({ type: "error", text: "网站图标URL不能为空" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // 重置所有设置
  const handleResetSettings = () => {
    if (confirm("确定要重置所有设置吗？这将恢复为默认值。")) {
      resetSettings()
      setMessage({ type: "success", text: "所有设置已重置为默认值" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // 当Logo类型改变时的处理
  const handleLogoTypeChange = (value: "text" | "image") => {
    setLogoType(value)
  }

  // 添加调试设置状态功能
  const debugSiteSettings = () => {
    try {
      const storage = typeof window !== "undefined" ? 
        localStorage.getItem("domain-display-site-settings-v2") : "未加载";
      
      console.log("当前内存设置:", settings);
      console.log("本地存储设置:", storage ? JSON.parse(storage) : "未找到");
      
      // 检查站点设置条目
      const allItems: Record<string, string | null> = {};
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              allItems[key] = localStorage.getItem(key);
            } catch (e) {
              allItems[key] = "无法读取";
            }
          }
        }
        console.log("所有localStorage条目:", allItems);
      }
      
      setMessage({ 
        type: "info", 
        text: `调试信息已打印到控制台。找到${storage ? "有" : "无"}设置数据。` 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("调试设置出错:", error);
      setMessage({ type: "error", text: "调试设置时出错" });
      setTimeout(() => setMessage(null), 3000);
    }
  }
  
  // 强制重置设置功能
  const forceResetSettings = () => {
    try {
      if (typeof window !== "undefined") {
        // 删除旧版和新版储存键
        localStorage.removeItem("domain-display-site-settings");
        localStorage.removeItem("domain-display-site-settings-v2");
        localStorage.removeItem("site_settings");
        
        console.log("已删除所有站点设置数据");
        
        // 重置设置
        resetSettings();
        
        setMessage({ 
          type: "success", 
          text: "已重置所有设置，将在3秒后刷新页面" 
        });
        
        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error("重置设置出错:", error);
      setMessage({ type: "error", text: "重置设置时出错" });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">站点设置</h2>
        <Button variant="outline" onClick={handleResetSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          重置为默认值
        </Button>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : message.type === "error" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}>
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              {message.type === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {message.type === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={message.type === "success" ? "text-green-600" : message.type === "error" ? "text-red-600" : "text-yellow-600"}>
                {message.text}
              </AlertDescription>
            </div>
            {message.type === "success" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                刷新页面
              </Button>
            )}
          </div>
        </Alert>
      )}

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="favicon">网站图标</TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-6 px-3 py-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-700">
          <p>设置功能已优化！现在修改Logo和站点名称后将立即生效，无需刷新页面。</p>
        </div>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
              <CardDescription>配置站点的基本信息和外观</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">站点名称 *</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="输入站点名称"
                  required
                />
                <p className="text-xs text-muted-foreground">站点名称将显示在浏览器标签页和各处页面标题</p>
              </div>

              <div className="space-y-2">
                <Label>顶部显示方式 *</Label>
                <RadioGroup value={logoType} onValueChange={handleLogoTypeChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="logo-text" />
                    <Label htmlFor="logo-text">显示文字</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="logo-image" />
                    <Label htmlFor="logo-image">显示图片</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">选择在网站顶部显示文字或图片标志</p>
              </div>

              {logoType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="logo-text-content">Logo文字 *</Label>
                  <Input
                    id="logo-text-content"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    placeholder="输入Logo文字"
                    required
                  />
                  <p className="text-xs text-muted-foreground">将在网站顶部显示的文字</p>
                </div>
              )}

              {logoType === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="logo-image-url">Logo图片URL *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="logo-image-url"
                      value={logoImage}
                      onChange={(e) => setLogoImage(e.target.value)}
                      placeholder="输入Logo图片URL"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      className="whitespace-nowrap"
                      onClick={() => {
                        if (!logoImage.trim()) {
                          setMessage({ type: "error", text: "请先输入图片URL" });
                          setTimeout(() => setMessage(null), 3000);
                          return;
                        }
                        
                        // 验证URL格式
                        let urlToTest = logoImage.trim();
                        try {
                          // 检查是否是有效的URL格式
                          if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
                            setMessage({ 
                              type: "error", 
                              text: "URL必须以http://或https://开头" 
                            });
                            setTimeout(() => setMessage(null), 4000);
                            return;
                          }
                          
                          // 创建一个临时图片元素来测试URL
                          setMessage({ type: "info", text: "正在测试图片URL，请稍候..." });
                          
                          const testImg = new Image();
                          testImg.onload = () => {
                            setMessage({ 
                              type: "success", 
                              text: `图片加载成功！尺寸: ${testImg.width}×${testImg.height}` 
                            });
                            
                            // 如果测试成功，立即更新预览
                            const previewImg = document.querySelector('#logoPreviewImg') as HTMLImageElement;
                            if (previewImg) {
                              previewImg.src = urlToTest;
                            }
                            
                            setTimeout(() => setMessage(null), 4000);
                          };
                          
                          testImg.onerror = () => {
                            setMessage({ 
                              type: "error", 
                              text: "图片URL无法加载，请检查URL是否正确或图片是否存在" 
                            });
                            setTimeout(() => setMessage(null), 4000);
                          };
                          
                          testImg.src = urlToTest;
                        } catch (err) {
                          setMessage({ 
                            type: "error", 
                            text: "无效的URL格式" 
                          });
                          setTimeout(() => setMessage(null), 3000);
                        }
                      }}
                    >
                      测试URL
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">图片应有合适的尺寸和透明背景，建议宽高比约3:1</p>
                  
                  <div className="mt-3 p-3 border rounded-md bg-blue-50 border-blue-100">
                    <p className="text-sm text-blue-700 mb-2 font-medium">使用图片模式的注意事项:</p>
                    <ul className="text-xs text-blue-600 space-y-1 list-disc pl-4">
                      <li>确保输入完整的图片URL，必须以http://或https://开头</li>
                      <li>图片必须是公开可访问的链接，不支持本地图片</li>
                      <li>推荐使用PNG或SVG格式，支持透明背景</li>
                      <li>保存设置后将立即应用到左上角</li>
                      <li>保存前可以使用"测试URL"按钮验证图片是否可用</li>
                    </ul>
                  </div>
                  
                  {logoImage && (
                    <div className="mt-3 p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-2">图片预览：</p>
                      <div className="flex flex-col space-y-2">
                        <div className="relative">
                          <img 
                            id="logoPreviewImg"
                            src={logoImage} 
                            alt="Logo预览" 
                            className="h-10 border border-dashed border-gray-200 p-1 rounded" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/200x60/e2e8f0/475569?text=图片加载失败";
                              setMessage({ 
                                type: "error", 
                                text: "Logo图片URL无法加载，请检查URL是否正确或图片是否存在" 
                              });
                              setTimeout(() => setMessage(null), 5000);
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          提示：保存前请确保图片可以正常显示，否则可能影响网站外观
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 设置预览区 */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-4">设置预览</h3>
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {logoType === "text" ? (
                        <span className="text-xl font-semibold">
                          {logoText || "Logo文字"}
                        </span>
                      ) : (
                        <div className="h-8 min-w-[120px]">
                          <img 
                            src={logoImage || "https://placehold.co/200x60/e2e8f0/475569?text=Logo"} 
                            alt="Logo" 
                            className="h-8 max-w-[150px] object-contain" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/200x60/e2e8f0/475569?text=预览加载失败"
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-4">
                      <span className="text-sm text-muted-foreground">首页</span>
                      <span className="text-sm text-muted-foreground">域名</span>
                      <span className="text-sm text-muted-foreground">设置</span>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <h1 className="text-2xl font-bold">{siteName || "站点名称"}</h1>
                    <p className="text-sm text-muted-foreground">预览当前的标题和Logo设置</p>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 border rounded p-2">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={favicon || "https://placehold.co/32x32/e2e8f0/475569?text=F"} 
                      alt="Favicon" 
                      className="w-4 h-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/32x32/e2e8f0/475569?text=F"
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{siteName || "站点名称"} - 浏览器标签预览</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                onClick={handleSaveBasicSettings}
                disabled={!siteName.trim() || (logoType === "text" && !logoText.trim()) || (logoType === "image" && !logoImage.trim())}
              >
                保存基本设置
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveAndView}
                disabled={!siteName.trim() || (logoType === "text" && !logoText.trim()) || (logoType === "image" && !logoImage.trim())}
              >
                保存并查看效果
              </Button>
            </CardFooter>
          </Card>

          {/* 开发调试工具 */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>高级设置</CardTitle>
              <CardDescription>这些操作用于调试和解决设置问题</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    如果设置无法正常保存或生效，可以尝试重置或调试：
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={debugSiteSettings}
              >
                调试设置
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if(confirm("确定要重置所有设置吗？这将删除所有自定义设置并还原默认值。")) {
                    forceResetSettings();
                  }
                }}
              >
                重置所有设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="favicon">
          <Card>
            <CardHeader>
              <CardTitle>网站图标</CardTitle>
              <CardDescription>配置网站的Favicon图标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favicon-url">Favicon URL *</Label>
                <Input
                  id="favicon-url"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="输入Favicon URL"
                  required
                />
                <p className="text-xs text-muted-foreground">建议使用ICO或PNG格式，尺寸至少为32×32像素</p>
                {favicon && (
                  <div className="mt-2 p-2 border rounded">
                    <p className="text-sm text-muted-foreground mb-2">预览：</p>
                    <img src={favicon || "/placeholder.svg"} alt="Favicon预览" className="h-8 w-8" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFavicon} disabled={!favicon.trim()}>保存Favicon</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 默认设置常量，用于重置
const DEFAULT_SETTINGS = {
  siteName: "域名展示",
  logoType: "text" as const,
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

