"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useDomainContext } from "@/contexts/domain-context"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Check, AlertCircle, RefreshCcw } from "lucide-react"

export function ServerSyncButton() {
  const { saveToServer, isLoading } = useDomainContext()
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    if (syncing || isLoading) return

    setSyncing(true)
    try {
      const success = await saveToServer()
      
      if (success) {
        toast({
          title: "同步成功",
          description: "数据已成功保存到服务器",
          action: <ToastAction altText="确定"><Check className="h-4 w-4" /></ToastAction>,
        })
      } else {
        toast({
          variant: "destructive",
          title: "同步失败",
          description: "数据保存到服务器时出错",
          action: <ToastAction altText="重试" onClick={handleSync}>重试</ToastAction>,
        })
      }
    } catch (error) {
      console.error("服务器同步错误:", error)
      toast({
        variant: "destructive",
        title: "同步失败",
        description: "发生意外错误，请稍后再试",
        action: <ToastAction altText="重试" onClick={handleSync}>重试</ToastAction>,
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={syncing || isLoading}
      className="w-full sm:w-auto"
      size="lg"
    >
      {syncing || isLoading ? (
        <>
          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          数据同步中...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          同步到服务器
        </>
      )}
    </Button>
  )
}

export function ServerSyncStatus({ lastSync }: { lastSync?: string }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      {lastSync ? (
        <>
          <Check className="mr-1 h-4 w-4 text-green-500" />
          上次同步: {lastSync}
        </>
      ) : (
        <>
          <AlertCircle className="mr-1 h-4 w-4 text-amber-500" />
          未同步到服务器
        </>
      )}
    </div>
  )
} 