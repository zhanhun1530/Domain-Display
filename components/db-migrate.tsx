"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Loader2, AlertCircle, FileJson } from "lucide-react"

export default function DatabaseMigrate() {
  const { toast } = useToast()
  const [isMigrating, setIsMigrating] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  // 执行数据迁移
  const migrateData = async () => {
    if (!confirm("确定要将JSON文件数据迁移到SQLite数据库吗？此操作将覆盖数据库中现有的数据。")) {
      return
    }
    
    setIsMigrating(true)
    
    try {
      // 调用同步API
      const response = await fetch('/api/domain-sync', {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "迁移数据失败")
      }
      
      const result = await response.json()
      
      // 保存统计信息
      setStats(result.stats)
      
      toast({
        title: "迁移成功",
        description: `成功将JSON数据迁移到SQLite数据库`,
      })
    } catch (error: any) {
      console.error("迁移数据失败:", error)
      toast({
        variant: "destructive",
        title: "迁移失败",
        description: error.message || "将数据迁移到SQLite数据库时发生错误"
      })
    } finally {
      setIsMigrating(false)
    }
  }
  
  // 获取数据库中的数据
  const fetchDbData = async () => {
    setIsMigrating(true)
    
    try {
      // 调用查询API
      const response = await fetch('/api/domain-sync')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取数据失败")
      }
      
      const result = await response.json()
      
      // 保存统计信息
      setStats(result.stats)
      
      toast({
        title: "查询成功",
        description: `成功获取SQLite数据库中的数据`,
      })
    } catch (error: any) {
      console.error("获取数据失败:", error)
      toast({
        variant: "destructive",
        title: "查询失败",
        description: error.message || "获取SQLite数据库数据时发生错误"
      })
    } finally {
      setIsMigrating(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary" />
          JSON数据迁移
        </CardTitle>
        <CardDescription>
          将JSON文件中的域名、注册商、已售域名和友情链接数据迁移到SQLite数据库
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileJson className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">JSON至SQLite迁移</span>
              </div>
              <Button 
                onClick={migrateData}
                disabled={isMigrating}
                variant="default" 
                size="sm"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    迁移中
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    执行迁移
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              将JSON文件中的数据迁移到SQLite数据库，以便在数据库备份中包含这些数据
            </p>
          </div>
          
          <div className="rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">数据库查询</span>
              </div>
              
              <Button 
                onClick={fetchDbData}
                disabled={isMigrating}
                variant="outline" 
                size="sm"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    查询中
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    查询数据
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              查询SQLite数据库中的域名、注册商、已售域名和友情链接数据
            </p>
          </div>
        </div>
        
        {stats && (
          <div className="rounded-md bg-muted/30 p-4">
            <h3 className="text-sm font-medium mb-2">数据统计</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="border rounded p-2">
                <div className="font-medium">域名</div>
                <div className="text-xl">{stats.domains}</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-medium">已售域名</div>
                <div className="text-xl">{stats.soldDomains}</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-medium">友情链接</div>
                <div className="text-xl">{stats.friendlyLinks}</div>
              </div>
            </div>
          </div>
        )}
        
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-600">
            注意：迁移操作会覆盖SQLite数据库中的现有数据，请确保您已备份重要数据
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground bg-muted/20">
        <span>迁移会影响：域名、注册商、已售域名和友情链接数据</span>
      </CardFooter>
    </Card>
  )
} 