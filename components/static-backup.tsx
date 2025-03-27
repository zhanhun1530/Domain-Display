"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Download, FileJson, Loader2 } from "lucide-react"
import { saveData } from "@/lib/data-service"
import { useDomainContext } from "@/contexts/domain-context"
import { useSite } from "@/contexts/site-context"

export function StaticBackup() {
  const { domains, soldDomains, friendlyLinks } = useDomainContext()
  const { settings } = useSite()
  const { toast } = useToast()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState({
    includeDomains: true,
    includeSoldDomains: true,
    includeFriendlyLinks: true, 
    includeSiteSettings: true,
    includePassword: true,
    prettify: true,
    saveToServer: false
  })
  
  // 获取登录密码
  const getPassword = (): string => {
    try {
      const authStr = localStorage.getItem("domain-display-auth")
      if (authStr) {
        const auth = JSON.parse(authStr)
        return auth.password || "admin123"
      }
    } catch (error) {
      console.error("获取密码失败:", error)
    }
    return "admin123"
  }
  
  // 创建特定格式的备份
  const createSpecificBackup = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    
    try {
      const timestamp = Date.now()
      const backupData: any = {
        timestamp,
        date: new Date(timestamp).toISOString()
      }
      
      // 根据选项添加数据
      if (options.includeDomains) {
        backupData.domains = domains
      }
      
      if (options.includeSoldDomains) {
        backupData.soldDomains = soldDomains
      }
      
      if (options.includeFriendlyLinks) {
        backupData.friendlyLinks = friendlyLinks
      }
      
      if (options.includeSiteSettings) {
        backupData.siteSettings = settings
      }
      
      if (options.includePassword) {
        backupData.auth = {
          password: getPassword()
        }
      }
      
      // 生成文件名
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const filename = `static-backup-${dateStr}.json`
      
      // 转换为JSON字符串
      const space = options.prettify ? 2 : 0
      const backupJson = JSON.stringify(backupData, null, space)
      
      // 保存到服务器
      if (options.saveToServer) {
        const success = await saveData(filename, backupData)
        
        if (success) {
          toast({
            title: "备份已保存",
            description: `静态备份已保存到服务器: ${filename}`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "保存失败",
            description: "保存备份到服务器时发生错误",
          })
        }
      } else {
        // 创建下载
        const blob = new Blob([backupJson], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          toast({
            title: "生成成功",
            description: "静态备份已下载至您的设备",
          })
        }, 100)
      }
    } catch (error) {
      console.error("生成静态备份失败:", error)
      
      toast({
        variant: "destructive",
        title: "生成失败",
        description: "创建静态备份时发生错误",
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // 更新选项
  const updateOption = (key: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // 数据统计信息
  const statsText = `${options.includeDomains ? domains.length : 0}个待售域名, ${options.includeSoldDomains ? soldDomains.length : 0}个已售域名, ${options.includeFriendlyLinks ? friendlyLinks.length : 0}个友情链接`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileJson className="h-5 w-5 mr-2 text-primary" />
          自定义静态备份
        </CardTitle>
        <CardDescription>
          根据您的需求创建特定格式的静态备份文件
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="domains" 
                checked={options.includeDomains}
                onCheckedChange={(checked) => 
                  updateOption('includeDomains', checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="domains" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  待售域名 ({domains.length})
                </Label>
                <p className="text-xs text-muted-foreground">
                  包含所有待售域名数据
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="soldDomains" 
                checked={options.includeSoldDomains}
                onCheckedChange={(checked) => 
                  updateOption('includeSoldDomains', checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="soldDomains" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  已售域名 ({soldDomains.length})
                </Label>
                <p className="text-xs text-muted-foreground">
                  包含所有已售域名数据
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="friendlyLinks" 
                checked={options.includeFriendlyLinks}
                onCheckedChange={(checked) => 
                  updateOption('includeFriendlyLinks', checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="friendlyLinks" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  友情链接 ({friendlyLinks.length})
                </Label>
                <p className="text-xs text-muted-foreground">
                  包含所有友情链接数据
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="siteSettings" 
                checked={options.includeSiteSettings}
                onCheckedChange={(checked) => 
                  updateOption('includeSiteSettings', checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="siteSettings" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  站点设置
                </Label>
                <p className="text-xs text-muted-foreground">
                  包含网站名称、Logo和注册商图标
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="password" 
                  checked={options.includePassword}
                  onCheckedChange={(checked) => 
                    updateOption('includePassword', checked === true)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    管理密码
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    包含管理员登录密码
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="prettify" 
                  checked={options.prettify}
                  onCheckedChange={(checked) => 
                    updateOption('prettify', checked === true)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="prettify" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    美化格式
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    生成缩进的可读性好的JSON
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="saveToServer" 
                  checked={options.saveToServer}
                  onCheckedChange={(checked) => 
                    updateOption('saveToServer', checked === true)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="saveToServer" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    保存到服务器
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    将备份保存到data目录而不是下载
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          将导出: {statsText}
        </span>
        
        <Button 
          onClick={createSpecificBackup}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              处理中...
            </>
          ) : options.saveToServer ? (
            <>
              <FileJson className="mr-2 h-4 w-4" />
              保存到服务器
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              生成并下载
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 