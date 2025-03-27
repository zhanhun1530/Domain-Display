"use client"

import { useState } from "react"
import { useDomainContext } from "@/contexts/domain-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, RefreshCw, Plus, Trash2, Edit, ExternalLink, Globe, Calendar, ShoppingCart, Upload, AlertCircle, Building } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RegistrarIcon } from "@/components/registrar-icon"
import { useSite } from "@/contexts/site-context"

// 域名类型定义
interface Domain {
  id: string
  name: string
  extension: string
  status: "active" | "available" | "sold"
  registrar?: string
  registrarIcon?: string
  registrationTime?: string
  expirationTime?: string
  purchaseUrl?: string
  soldTo?: string
  soldDate?: string
}

// 友情链接类型定义
interface FriendlyLink {
  id: string
  name: string
  url: string
  description: string
}

export default function DomainManager() {
  const {
    domains,
    soldDomains,
    friendlyLinks,
    updateDomains,
    updateSoldDomains,
    updateFriendlyLinks,
    resetToDefaults,
  } = useDomainContext()

  const { settings, addRegistrarIcon, updateRegistrarIcon, removeRegistrarIcon } = useSite()

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 域名编辑状态
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [isAddingDomain, setIsAddingDomain] = useState(false)

  // 已售域名编辑状态
  const [editingSoldDomain, setEditingSoldDomain] = useState<Domain | null>(null)
  const [isAddingSoldDomain, setIsAddingSoldDomain] = useState(false)

  // 友情链接编辑状态
  const [editingLink, setEditingLink] = useState<FriendlyLink | null>(null)
  const [isAddingLink, setIsAddingLink] = useState(false)

  // 注册商图标编辑状态
  const [newIconName, setNewIconName] = useState("")
  const [newIconSvg, setNewIconSvg] = useState("")
  const [editIconName, setEditIconName] = useState("")
  const [editIconSvg, setEditIconSvg] = useState("")
  const [isAddIconDialogOpen, setIsAddIconDialogOpen] = useState(false)
  const [isEditIconDialogOpen, setIsEditIconDialogOpen] = useState(false)

  // 批量导入状态
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState("")
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json")
  const [importError, setImportError] = useState<string | null>(null)

  // 添加批量选择的状态和功能
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [isBatchRegistrarDialogOpen, setIsBatchRegistrarDialogOpen] = useState(false)
  const [batchRegistrar, setBatchRegistrar] = useState("")
  const [batchRegistrarIcon, setBatchRegistrarIcon] = useState("")

  // 添加选择现有域名的状态
  const [isSelectingExistingDomain, setIsSelectingExistingDomain] = useState(false)

  // 显示成功消息
  const showSuccessMessage = (text: string) => {
    setMessage({ type: "success", text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 显示错误消息
  const showErrorMessage = (text: string) => {
    setMessage({ type: "error", text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 重置所有数据
  const handleReset = () => {
    if (confirm("确定要重置所有数据到默认值吗？")) {
      resetToDefaults()
      showSuccessMessage("所有数据已重置为默认值")
    }
  }

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // 添加新域名
  const handleAddDomain = () => {
    const newDomain: Domain = {
      id: generateId(),
      name: editingDomain?.name || "",
      extension: editingDomain?.extension || "",
      status: "available",
      registrar: editingDomain?.registrar || "",
      registrarIcon: editingDomain?.registrarIcon || "",
      registrationTime: editingDomain?.registrationTime || new Date().toISOString().split("T")[0],
      purchaseUrl: editingDomain?.purchaseUrl || "",
    }

    if (!newDomain.name || !newDomain.extension) {
      showErrorMessage("域名和后缀不能为空")
      return
    }

    updateDomains([...domains, newDomain])
    setIsAddingDomain(false)
    setEditingDomain(null)
    showSuccessMessage("域名已添加")
  }

  // 更新域名
  const handleUpdateDomain = () => {
    if (!editingDomain) return

    if (!editingDomain.name || !editingDomain.extension) {
      showErrorMessage("域名和后缀不能为空")
      return
    }

    const updatedDomains = domains.map((domain) => (domain.id === editingDomain.id ? editingDomain : domain))

    updateDomains(updatedDomains)
    setEditingDomain(null)
    showSuccessMessage("域名已更新")
  }

  // 删除域名
  const handleDeleteDomain = (id: string) => {
    if (confirm("确定要删除这个域名吗？")) {
      const updatedDomains = domains.filter((domain) => domain.id !== id)
      updateDomains(updatedDomains)
      showSuccessMessage("域名已删除")
    }
  }

  // 添加已售域名
  const handleAddSoldDomain = () => {
    const newDomain: Domain = {
      id: generateId(),
      name: editingSoldDomain?.name || "",
      extension: editingSoldDomain?.extension || "",
      status: "sold",
      soldTo: editingSoldDomain?.soldTo || "",
      soldDate: editingSoldDomain?.soldDate || new Date().toISOString().split("T")[0],
    }

    if (!newDomain.name || !newDomain.extension) {
      showErrorMessage("域名和后缀不能为空")
      return
    }

    updateSoldDomains([...soldDomains, newDomain])
    setIsAddingSoldDomain(false)
    setEditingSoldDomain(null)
    showSuccessMessage("已售域名已添加")
  }

  // 更新已售域名
  const handleUpdateSoldDomain = () => {
    if (!editingSoldDomain) return

    if (!editingSoldDomain.name || !editingSoldDomain.extension) {
      showErrorMessage("域名和后缀不能为空")
      return
    }

    const updatedDomains = soldDomains.map((domain) =>
      domain.id === editingSoldDomain.id ? editingSoldDomain : domain,
    )

    updateSoldDomains(updatedDomains)
    setEditingSoldDomain(null)
    showSuccessMessage("已售域名已更新")
  }

  // 删除已售域名
  const handleDeleteSoldDomain = (id: string) => {
    if (confirm("确定要删除这个已售域名吗？")) {
      const updatedDomains = soldDomains.filter((domain) => domain.id !== id)
      updateSoldDomains(updatedDomains)
      showSuccessMessage("已售域名已删除")
    }
  }

  // 添加友情链接
  const handleAddLink = () => {
    const newLink: FriendlyLink = {
      id: generateId(),
      name: editingLink?.name || "",
      url: editingLink?.url || "",
      description: editingLink?.description || "",
    }

    if (!newLink.name || !newLink.url) {
      showErrorMessage("名称和URL不能为空")
      return
    }

    updateFriendlyLinks([...friendlyLinks, newLink])
    setIsAddingLink(false)
    setEditingLink(null)
    showSuccessMessage("友情链接已添加")
  }

  // 更新友情链接
  const handleUpdateLink = () => {
    if (!editingLink) return

    if (!editingLink.name || !editingLink.url) {
      showErrorMessage("名称和URL不能为空")
      return
    }

    const updatedLinks = friendlyLinks.map((link) => (link.id === editingLink.id ? editingLink : link))

    updateFriendlyLinks(updatedLinks)
    setEditingLink(null)
    showSuccessMessage("友情链接已更新")
  }

  // 删除友情链接
  const handleDeleteLink = (id: string) => {
    if (confirm("确定要删除这个友情链接吗？")) {
      const updatedLinks = friendlyLinks.filter((link) => link.id !== id)
      updateFriendlyLinks(updatedLinks)
      showSuccessMessage("友情链接已删除")
    }
  }

  // 获取可用的注册商图标列表
  const getRegistrarIcons = () => {
    // 检查settings.registrarIcons是否是对象类型
    if (typeof settings.registrarIcons === 'object' && settings.registrarIcons !== null) {
      // 返回对象的键数组
    return Object.keys(settings.registrarIcons || {})
    }
    return []
  }

  // 添加注册商图标
  const handleAddRegistrarIcon = () => {
    if (!newIconName.trim()) {
      showErrorMessage("请输入注册商名称")
      return
    }

    if (!newIconSvg.trim()) {
      showErrorMessage("请输入SVG代码")
      return
    }

    try {
      addRegistrarIcon(newIconName.trim(), newIconSvg.trim())
      setNewIconName("")
      setNewIconSvg("")
      setIsAddIconDialogOpen(false)
      showSuccessMessage("注册商图标已添加")
    } catch (error) {
      console.error("添加注册商图标失败:", error)
      showErrorMessage("添加注册商图标失败，请重试")
    }
  }

  // 打开编辑图标对话框
  const handleEditIcon = (name: string) => {
    try {
      setEditIconName(name)
      // 从对象中获取SVG字符串
      setEditIconSvg(settings.registrarIcons[name] || "")
      setIsEditIconDialogOpen(true)
    } catch (error) {
      console.error("获取图标失败:", error)
    }
  }

  // 更新注册商图标
  const handleUpdateRegistrarIcon = () => {
    if (!editIconSvg.trim()) {
      showErrorMessage("请输入SVG代码")
      return
    }

    try {
      updateRegistrarIcon(editIconName, editIconSvg.trim())
      setIsEditIconDialogOpen(false)
      showSuccessMessage("注册商图标已更新")
    } catch (error) {
      console.error("更新注册商图标失败:", error)
      showErrorMessage("更新注册商图标失败，请重试")
    }
  }

  // 删除注册商图标
  const handleRemoveRegistrarIcon = (name: string) => {
    if (confirm(`确定要删除 ${name} 的图标吗？`)) {
      try {
        removeRegistrarIcon(name)
        showSuccessMessage("注册商图标已删除")
      } catch (error) {
        console.error("删除注册商图标失败:", error)
        showErrorMessage("删除注册商图标失败，请重试")
      }
    }
  }

  // 标记为已售
  const handleMarkAsSold = (domain: Domain) => {
    try {
      // 创建已售域名记录
      const soldDomain: Domain = {
        id: generateId(), // 生成新ID
        name: domain.name,
        extension: domain.extension,
        status: "sold",
        soldTo: "", // 初始为空，用户需要填写
        soldDate: new Date().toISOString().split("T")[0],
      }
      
      // 打开编辑对话框让用户填写购买方等信息
      setEditingSoldDomain(soldDomain)
      setIsAddingSoldDomain(false) // 不是添加新的，而是转换现有的
      
      // 删除原待售域名
      const updatedDomains = domains.filter((d) => d.id !== domain.id)
      updateDomains(updatedDomains)
      
      showSuccessMessage("域名已标记为待售状态，请填写购买方信息")
    } catch (error) {
      console.error("标记域名为已售出状态失败:", error)
      showErrorMessage("操作失败，请重试")
    }
  }

  // 添加批量导入域名的处理函数
  const handleImportDomains = () => {
    try {
      setImportError(null)
      let newDomains: Domain[] = []
      
      if (importFormat === "json") {
        try {
          const parsed = JSON.parse(importData.trim())
          if (!Array.isArray(parsed)) {
            throw new Error("导入的数据不是数组格式")
          }
          
          // 验证每个域名对象
          newDomains = parsed.map((item: any, index) => {
            if (!item.name || !item.extension) {
              throw new Error(`第 ${index + 1} 项域名缺少必要字段`)
            }
            
            return {
              id: item.id || generateId(),
              name: item.name,
              extension: item.extension,
              status: item.status || "available",
              registrar: item.registrar || "",
              registrarIcon: item.registrarIcon || "",
              registrationTime: item.registrationTime || new Date().toISOString().split("T")[0],
              expirationTime: item.expirationTime || "",
              purchaseUrl: item.purchaseUrl || "",
            }
          })
        } catch (error) {
          setImportError(`JSON解析错误: ${error instanceof Error ? error.message : "未知错误"}`)
          return
        }
      } else if (importFormat === "csv") {
        try {
          // 简单的CSV解析
          const lines = importData.trim().split(/\r?\n/)
          const headers = lines[0].split(",")
          
          // 检查必要的列
          const nameIndex = headers.findIndex(h => h.trim().toLowerCase() === "name")
          const extensionIndex = headers.findIndex(h => h.trim().toLowerCase() === "extension")
          
          if (nameIndex === -1 || extensionIndex === -1) {
            throw new Error("CSV 必须包含 name 和 extension 列")
          }
          
          // 解析数据行
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",")
            if (values.length < Math.max(nameIndex, extensionIndex) + 1) {
              throw new Error(`第 ${i} 行数据不完整`)
            }
            
            const domain: Domain = {
              id: generateId(),
              name: values[nameIndex].trim(),
              extension: values[extensionIndex].trim(),
              status: "available",
              registrar: "",
              registrationTime: new Date().toISOString().split("T")[0],
            }
            
            // 处理可选字段
            const registrarIndex = headers.findIndex(h => h.trim().toLowerCase() === "registrar")
            if (registrarIndex !== -1 && values[registrarIndex]) {
              domain.registrar = values[registrarIndex].trim()
            }
            
            const iconIndex = headers.findIndex(h => h.trim().toLowerCase() === "registraricon")
            if (iconIndex !== -1 && values[iconIndex]) {
              domain.registrarIcon = values[iconIndex].trim()
            }
            
            const urlIndex = headers.findIndex(h => h.trim().toLowerCase() === "purchaseurl")
            if (urlIndex !== -1 && values[urlIndex]) {
              domain.purchaseUrl = values[urlIndex].trim()
            }
            
            newDomains.push(domain)
          }
        } catch (error) {
          setImportError(`CSV解析错误: ${error instanceof Error ? error.message : "未知错误"}`)
          return
        }
      }
      
      // 检查是否有域名要导入
      if (newDomains.length === 0) {
        setImportError("没有发现有效的域名数据")
        return
      }
      
      // 更新域名列表
      updateDomains([...domains, ...newDomains])
      setIsImportDialogOpen(false)
      setImportData("")
      showSuccessMessage(`成功导入 ${newDomains.length} 个域名`)
    } catch (error) {
      setImportError(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  // 处理批量选择域名
  const handleSelectDomain = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedDomains(prev => [...prev, id])
    } else {
      setSelectedDomains(prev => prev.filter(domainId => domainId !== id))
    }
  }

  // 全选/取消全选
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedDomains(domains.map(domain => domain.id))
    } else {
      setSelectedDomains([])
    }
  }

  // 批量设置注册商
  const handleBatchUpdateRegistrar = () => {
    if (!batchRegistrar || selectedDomains.length === 0) {
      showErrorMessage("请选择域名并设置注册商")
      return
    }

    try {
      const updatedDomains = domains.map(domain => {
        if (selectedDomains.includes(domain.id)) {
          return {
            ...domain,
            registrar: batchRegistrar,
            registrarIcon: batchRegistrarIcon || domain.registrarIcon,
          }
        }
        return domain
      })

      updateDomains(updatedDomains)
      setIsBatchRegistrarDialogOpen(false)
      setSelectedDomains([])
      setBatchRegistrar("")
      setBatchRegistrarIcon("")
      showSuccessMessage(`已成功为 ${selectedDomains.length} 个域名设置注册商`)
    } catch (error) {
      showErrorMessage("批量设置失败，请重试")
    }
  }

  // 添加获取所有注册商名称的函数
  const getAllRegistrars = () => {
    // 获取当前域名中的所有注册商名称
    const registrarSet = new Set<string>();
    domains.forEach(domain => {
      if (domain.registrar) {
        registrarSet.add(domain.registrar);
      }
    });
    return Array.from(registrarSet).sort();
  }

  // 添加从现有域名选择的处理函数
  const handleSelectExistingDomain = (domainId: string) => {
    const selectedDomain = domains.find(d => d.id === domainId);
    if (selectedDomain) {
      setEditingSoldDomain({
        id: generateId(),
        name: selectedDomain.name,
        extension: selectedDomain.extension,
        status: "sold",
        soldDate: new Date().toISOString().split("T")[0],
        soldTo: ""
      });
      setIsSelectingExistingDomain(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">域名数据管理</h2>
        <Button variant="outline" size="sm" onClick={handleReset} className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          重置为默认值
        </Button>
      </div>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : undefined}
          className={message.type === "success" ? "bg-green-50 border-green-200" : undefined}
        >
          {message.type === "error" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-600" : undefined}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="registrar">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="registrar">注册商</TabsTrigger>
          <TabsTrigger value="active">待售域名</TabsTrigger>
          <TabsTrigger value="sold">已售域名</TabsTrigger>
          <TabsTrigger value="links">友情链接</TabsTrigger>
        </TabsList>

        {/* 注册商管理 */}
        <TabsContent value="registrar">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>注册商管理</CardTitle>
                  <CardDescription>管理域名注册商图标</CardDescription>
                </div>
                <Dialog open={isAddIconDialogOpen} onOpenChange={setIsAddIconDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      添加注册商图标
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>添加注册商</DialogTitle>
                      <DialogDescription>
                        添加新的域名注册商SVG图标。请确保SVG代码中的class属性已替换为className。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-icon-name">注册商名称</Label>
                        <Input
                          id="new-icon-name"
                          value={newIconName}
                          onChange={(e) => setNewIconName(e.target.value)}
                          placeholder="例如：aliyun"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-icon-svg">SVG代码</Label>
                        <Textarea
                          id="new-icon-svg"
                          value={newIconSvg}
                          onChange={(e) => setNewIconSvg(e.target.value)}
                          placeholder="粘贴SVG代码"
                          className="font-mono h-40"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddIconDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddRegistrarIcon}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {Object.entries(settings.registrarIcons || {}).map(([name, svg]) => (
                  <Card key={name} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditIcon(name)}>
                            编辑
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveRegistrarIcon(name)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!settings.registrarIcons || Object.keys(settings.registrarIcons).length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">暂无注册商图标</p>
                </div>
              )}

              <Dialog open={isEditIconDialogOpen} onOpenChange={setIsEditIconDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>编辑注册商</DialogTitle>
                    <DialogDescription>
                      编辑 {editIconName} 的SVG图标。请确保SVG代码中的class属性已替换为className。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-icon-svg">SVG代码</Label>
                      <Textarea
                        id="edit-icon-svg"
                        value={editIconSvg}
                        onChange={(e) => setEditIconSvg(e.target.value)}
                        placeholder="粘贴SVG代码"
                        className="font-mono h-40"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditIconDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleUpdateRegistrarIcon}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 待售域名管理 */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>待售域名管理</CardTitle>
                  <CardDescription>管理您的待售域名列表</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Dialog>
                  <DialogTrigger asChild>
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => {
                        setEditingDomain({
                          id: "",
                          name: "",
                          extension: "",
                          status: "available",
                          registrationTime: new Date().toISOString().split("T")[0],
                        });
                        setIsAddingDomain(true);
                      }}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加域名
                    </Button>
                  </DialogTrigger>
                  </Dialog>
                  <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm" className="flex-1 sm:flex-grow-0">
                    <Upload className="h-4 w-4 mr-2" />
                    批量导入
                  </Button>
                        </div>
                        </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-center my-4 gap-2">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <input
                    type="checkbox"
                    id="select-all"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedDomains.length === domains.length && domains.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <Label htmlFor="select-all" className="text-sm cursor-pointer">
                    全选 ({selectedDomains.length}/{domains.length})
                  </Label>
                        </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportDialogOpen(true)}
                    className="flex-1 sm:flex-grow-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    批量导入
                      </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedDomains.length === 0}
                    onClick={() => setIsBatchRegistrarDialogOpen(true)}
                    className="flex-1 sm:flex-grow-0"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    批量设置注册商
                  </Button>
              </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {domains.map((domain) => (
                  <Card key={domain.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedDomains.includes(domain.id)}
                            onChange={(e) => handleSelectDomain(domain.id, e.target.checked)}
                          />
                          <span className="truncate font-medium">{domain.name}{domain.extension}</span>
                        </div>
                        {domain.registrationTime && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(domain.registrationTime)}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-1">
                          <span className="text-foreground">{domain.name}</span>
                          <span className="text-muted-foreground">{domain.extension}</span>
                        </h2>
                        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full ${domain.status === "active" ? "bg-green-500" : "bg-amber-500"} mr-2`}
                            ></div>
                            <span className="text-sm text-muted-foreground">待出售</span>
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setEditingDomain({ ...domain })}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>编辑域名</DialogTitle>
                                  <DialogDescription>修改域名信息</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-name">域名</Label>
                                      <Input
                                        id="edit-domain-name"
                                        value={editingDomain?.name || ""}
                                        onChange={(e) =>
                                          setEditingDomain((prev) => (prev ? { ...prev, name: e.target.value } : null))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-extension">后缀</Label>
                                      <Input
                                        id="edit-domain-extension"
                                        value={editingDomain?.extension || ""}
                                        onChange={(e) =>
                                          setEditingDomain((prev) =>
                                            prev ? { ...prev, extension: e.target.value } : null,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-registrar">注册商</Label>
                                      <Select
                                        value={editingDomain?.registrar || ""}
                                        onValueChange={(value) =>
                                          setEditingDomain((prev) => {
                                            if (!prev) return null;
                                            
                                            // 自动设置对应的图标
                                            const matchingIcon = getRegistrarIcons().find(
                                              icon => icon.toLowerCase() === value.toLowerCase()
                                            );
                                            
                                            
                                            return { 
                                              ...prev, 
                                              registrar: value,
                                              // 如果有匹配的图标名称，自动设置
                                              registrarIcon: matchingIcon || prev.registrarIcon
                                            };
                                          })
                                        }
                                      >
                                        <SelectTrigger id="edit-domain-registrar" className="w-full">
                                          <SelectValue placeholder="选择或输入注册商" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getAllRegistrars().map((registrar) => (
                                            <SelectItem key={registrar} value={registrar}>
                                              {registrar}
                                            </SelectItem>
                                          ))}
                                          <div className="px-3 py-2 border-t">
                                      <Input
                                              placeholder="输入其他注册商..."
                                        value={editingDomain?.registrar || ""}
                                        onChange={(e) =>
                                          setEditingDomain((prev) =>
                                                  prev ? { ...prev, registrar: e.target.value } : null
                                          )
                                        }
                                              className="mt-1"
                                      />
                                          </div>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-registrar-icon">注册商图标</Label>
                                      <Select
                                        value={editingDomain?.registrarIcon || ""}
                                        onValueChange={(value) =>
                                          setEditingDomain((prev) => (prev ? { ...prev, registrarIcon: value } : null))
                                        }
                                      >
                                        <SelectTrigger id="edit-domain-registrar-icon">
                                          <SelectValue placeholder="选择图标" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getRegistrarIcons().map((icon) => (
                                            <SelectItem key={icon} value={icon}>
                                              <div className="flex items-center">
                                                <RegistrarIcon iconName={icon} className="h-4 w-4 mr-2" />
                                                <span>{icon}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-registration-time">注册时间</Label>
                                      <Input
                                        id="edit-domain-registration-time"
                                        type="date"
                                        value={
                                          editingDomain?.registrationTime
                                            ? formatDate(editingDomain.registrationTime)
                                            : ""
                                        }
                                        onChange={(e) =>
                                          setEditingDomain((prev) =>
                                            prev ? { ...prev, registrationTime: e.target.value } : null,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-domain-expiration-time">到期时间</Label>
                                      <Input
                                        id="edit-domain-expiration-time"
                                        type="date"
                                        value={
                                          editingDomain?.expirationTime ? formatDate(editingDomain.expirationTime) : ""
                                        }
                                        onChange={(e) =>
                                          setEditingDomain((prev) =>
                                            prev ? { ...prev, expirationTime: e.target.value } : null,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-domain-purchase-url">购买链接</Label>
                                    <Input
                                      id="edit-domain-purchase-url"
                                      value={editingDomain?.purchaseUrl || ""}
                                      onChange={(e) =>
                                        setEditingDomain((prev) =>
                                          prev ? { ...prev, purchaseUrl: e.target.value } : null,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditingDomain(null)}>
                                    取消
                                  </Button>
                                  <Button onClick={handleUpdateDomain}>保存</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDomain(domain.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsSold(domain)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              标记为已售
                            </Button>
                          </div>
                        </div>
                        {domain.purchaseUrl && (
                          <div className="mt-4">
                            <Button size="sm" variant="outline" className="w-full" asChild>
                              <a href={domain.purchaseUrl} target="_blank" rel="noopener noreferrer">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                购买链接
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {domains.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">暂无域名，点击"添加域名"按钮添加</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 已售域名管理 */}
        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>已售域名管理</CardTitle>
                  <CardDescription>管理您的已售域名列表</CardDescription>
                </div>
                <Dialog open={isAddingSoldDomain} onOpenChange={setIsAddingSoldDomain}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() =>
                        setEditingSoldDomain({
                          id: "",
                          name: "",
                          extension: "",
                          status: "sold",
                          soldDate: new Date().toISOString().split("T")[0],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加已售域名
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>添加已售域名</DialogTitle>
                      <DialogDescription>添加一个已售出的域名到您的列表中</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h3 className="text-sm font-medium">选择来源</h3>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <Button 
                            variant={isSelectingExistingDomain ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => setIsSelectingExistingDomain(false)}
                            className="flex-1 sm:flex-grow-0"
                          >
                            手动添加
                          </Button>
                          <Button 
                            variant={isSelectingExistingDomain ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setIsSelectingExistingDomain(true)}
                            className="flex-1 sm:flex-grow-0"
                          >
                            从待售域名选择
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {isSelectingExistingDomain ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="select-existing-domain">选择待售域名</Label>
                          <Select onValueChange={handleSelectExistingDomain}>
                            <SelectTrigger id="select-existing-domain">
                              <SelectValue placeholder="选择一个待售域名" />
                            </SelectTrigger>
                            <SelectContent>
                              {domains.map(domain => (
                                <SelectItem key={domain.id} value={domain.id}>
                                  {domain.name}{domain.extension} 
                                  {domain.registrar && <span className="text-muted-foreground ml-2">({domain.registrar})</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {domains.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">暂无待售域名可选择</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sold-domain-name">域名</Label>
                          <Input
                            id="sold-domain-name"
                            value={editingSoldDomain?.name || ""}
                            onChange={(e) =>
                              setEditingSoldDomain((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                            placeholder="example"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sold-domain-extension">后缀</Label>
                          <Input
                            id="sold-domain-extension"
                            value={editingSoldDomain?.extension || ""}
                            onChange={(e) =>
                              setEditingSoldDomain((prev) => (prev ? { ...prev, extension: e.target.value } : null))
                            }
                            placeholder=".com"
                          />
                        </div>
                      </div>
                      </div>
                    )}
                    
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sold-domain-sold-to">购买方</Label>
                          <Input
                            id="sold-domain-sold-to"
                            value={editingSoldDomain?.soldTo || ""}
                            onChange={(e) =>
                              setEditingSoldDomain((prev) => (prev ? { ...prev, soldTo: e.target.value } : null))
                            }
                            placeholder="公司名称"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sold-domain-sold-date">售出日期</Label>
                          <Input
                            id="sold-domain-sold-date"
                            type="date"
                            value={editingSoldDomain?.soldDate ? formatDate(editingSoldDomain.soldDate) : ""}
                            onChange={(e) =>
                              setEditingSoldDomain((prev) => (prev ? { ...prev, soldDate: e.target.value } : null))
                            }
                          />
                        </div>
                      </div>
                    
                    {/* 如果是从待售域名选择，则添加选项以从待售列表中删除 */}
                    {isSelectingExistingDomain && (
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="remove-from-available"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                          checked
                          disabled
                        />
                        <Label htmlFor="remove-from-available" className="text-sm">
                          自动从待售域名列表中移除
                        </Label>
                    </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsAddingSoldDomain(false);
                        setIsSelectingExistingDomain(false);
                      }}>
                        取消
                      </Button>
                      <Button onClick={() => {
                        if (isSelectingExistingDomain && editingSoldDomain) {
                          // 如果是从待售域名选择的，则调用标记为已售函数
                          const originalDomain = domains.find(d => 
                            d.name === editingSoldDomain.name && 
                            d.extension === editingSoldDomain.extension
                          );
                          if (originalDomain) {
                            handleMarkAsSold(originalDomain);
                            setIsAddingSoldDomain(false);
                          } else {
                            handleAddSoldDomain();
                          }
                        } else {
                          // 否则正常添加
                          handleAddSoldDomain();
                        }
                      }}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldDomains.map((domain) => (
                  <Card key={domain.id} className="overflow-hidden bg-muted/30">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium">已售出</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {domain.soldDate && formatDate(domain.soldDate)}
                        </span>
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-bold mb-1">
                          <span className="text-foreground">{domain.name}</span>
                          <span className="text-muted-foreground">{domain.extension}</span>
                        </h2>
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">购买方：</span>
                            <span className="text-sm font-medium">{domain.soldTo}</span>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditingSoldDomain({ ...domain })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>编辑已售域名</DialogTitle>
                                <DialogDescription>修改已售域名信息</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sold-domain-name">域名</Label>
                                    <Input
                                      id="edit-sold-domain-name"
                                      value={editingSoldDomain?.name || ""}
                                      onChange={(e) =>
                                        setEditingSoldDomain((prev) =>
                                          prev ? { ...prev, name: e.target.value } : null,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sold-domain-extension">后缀</Label>
                                    <Input
                                      id="edit-sold-domain-extension"
                                      value={editingSoldDomain?.extension || ""}
                                      onChange={(e) =>
                                        setEditingSoldDomain((prev) =>
                                          prev ? { ...prev, extension: e.target.value } : null,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sold-domain-sold-to">购买方</Label>
                                    <Input
                                      id="edit-sold-domain-sold-to"
                                      value={editingSoldDomain?.soldTo || ""}
                                      onChange={(e) =>
                                        setEditingSoldDomain((prev) =>
                                          prev ? { ...prev, soldTo: e.target.value } : null,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sold-domain-sold-date">售出日期</Label>
                                    <Input
                                      id="edit-sold-domain-sold-date"
                                      type="date"
                                      value={editingSoldDomain?.soldDate ? formatDate(editingSoldDomain.soldDate) : ""}
                                      onChange={(e) =>
                                        setEditingSoldDomain((prev) =>
                                          prev ? { ...prev, soldDate: e.target.value } : null,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingSoldDomain(null)}>
                                  取消
                                </Button>
                                <Button onClick={handleUpdateSoldDomain}>保存</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSoldDomain(domain.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {soldDomains.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">暂无已售域名，点击"添加已售域名"按钮添加</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 友情链接管理 */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>友情链接管理</CardTitle>
                  <CardDescription>管理您的友情链接列表</CardDescription>
                </div>
                <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() =>
                        setEditingLink({
                          id: "",
                          name: "",
                          url: "",
                          description: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加友情链接
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>添加友情链接</DialogTitle>
                      <DialogDescription>添加一个新的友情链接到您的列表中</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="link-name">名称</Label>
                        <Input
                          id="link-name"
                          value={editingLink?.name || ""}
                          onChange={(e) => setEditingLink((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                          placeholder="网站名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link-url">URL</Label>
                        <Input
                          id="link-url"
                          value={editingLink?.url || ""}
                          onChange={(e) => setEditingLink((prev) => (prev ? { ...prev, url: e.target.value } : null))}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link-description">描述</Label>
                        <Input
                          id="link-description"
                          value={editingLink?.description || ""}
                          onChange={(e) =>
                            setEditingLink((prev) => (prev ? { ...prev, description: e.target.value } : null))
                          }
                          placeholder="网站描述"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddLink}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendlyLinks.map((link) => (
                  <Card key={link.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {link.name}
                        </h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setEditingLink({ ...link })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>编辑友情链接</DialogTitle>
                                <DialogDescription>修改友情链接信息</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-link-name">名称</Label>
                                  <Input
                                    id="edit-link-name"
                                    value={editingLink?.name || ""}
                                    onChange={(e) =>
                                      setEditingLink((prev) => (prev ? { ...prev, name: e.target.value } : null))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-link-url">URL</Label>
                                  <Input
                                    id="edit-link-url"
                                    value={editingLink?.url || ""}
                                    onChange={(e) =>
                                      setEditingLink((prev) => (prev ? { ...prev, url: e.target.value } : null))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-link-description">描述</Label>
                                  <Input
                                    id="edit-link-description"
                                    value={editingLink?.description || ""}
                                    onChange={(e) =>
                                      setEditingLink((prev) => (prev ? { ...prev, description: e.target.value } : null))
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingLink(null)}>
                                  取消
                                </Button>
                                <Button onClick={handleUpdateLink}>保存</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                      <div className="mt-4 text-xs text-muted-foreground truncate">{link.url}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {friendlyLinks.length === 0 && (
                <div className="text-center py-12">
                  <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">暂无友情链接，点击"添加友情链接"按钮添加</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 批量导入对话框 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量导入域名</DialogTitle>
            <DialogDescription>
              导入JSON或CSV格式的域名数据。JSON格式必须是数组。CSV格式必须包含name和extension列。
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="json" value={importFormat} onValueChange={(value) => setImportFormat(value as "json" | "csv")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json">JSON格式</TabsTrigger>
              <TabsTrigger value="csv">CSV格式</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="pt-4">
              <Label htmlFor="json-import">JSON数据</Label>
              <Textarea
                id="json-import"
                placeholder={`[
  {
    "name": "example",
    "extension": ".com",
    "registrar": "阿里云",
    "registrarIcon": "aliyun"
  }
]`}
                className="min-h-[200px] font-mono text-sm"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </TabsContent>
            
            <TabsContent value="csv" className="pt-4">
              <Label htmlFor="csv-import">CSV数据</Label>
              <Textarea
                id="csv-import"
                placeholder="name,extension,registrar,registrarIcon
example,com,阿里云,aliyun
mysite,org,腾讯云,tencent"
                className="min-h-[200px] font-mono text-sm"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </TabsContent>
          </Tabs>
          
          {importError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <div className="ml-2">{importError}</div>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImportDomains} disabled={!importData.trim()}>
              导入域名
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 恢复添加域名对话框 */}
      <Dialog open={isAddingDomain} onOpenChange={setIsAddingDomain}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新域名</DialogTitle>
            <DialogDescription>添加一个新的待售域名到您的列表中</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain-name">域名</Label>
                <Input
                  id="domain-name"
                  value={editingDomain?.name || ""}
                  onChange={(e) =>
                    setEditingDomain((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  placeholder="example"
                />
    </div>
              <div className="space-y-2">
                <Label htmlFor="domain-extension">后缀</Label>
                <Input
                  id="domain-extension"
                  value={editingDomain?.extension || ""}
                  onChange={(e) =>
                    setEditingDomain((prev) => (prev ? { ...prev, extension: e.target.value } : null))
                  }
                  placeholder=".com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain-registrar">注册商</Label>
                <Select
                  value={editingDomain?.registrar || ""}
                  onValueChange={(value) =>
                    setEditingDomain((prev) => {
                      if (!prev) return null;
                      
                      // 自动设置对应的图标
                      const matchingIcon = getRegistrarIcons().find(
                        icon => icon.toLowerCase() === value.toLowerCase()
                      );
                      
                      return { 
                        ...prev, 
                        registrar: value,
                        // 如果有匹配的图标名称，自动设置
                        registrarIcon: matchingIcon || prev.registrarIcon
                      };
                    })
                  }
                >
                  <SelectTrigger id="domain-registrar" className="w-full">
                    <SelectValue placeholder="选择或输入注册商" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllRegistrars().map((registrar) => (
                      <SelectItem key={registrar} value={registrar}>
                        {registrar}
                      </SelectItem>
                    ))}
                    <div className="px-3 py-2 border-t">
                      <Input
                        placeholder="输入其他注册商..."
                        value={editingDomain?.registrar || ""}
                        onChange={(e) => 
                          setEditingDomain((prev) => 
                            prev ? { ...prev, registrar: e.target.value } : null
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain-registrar-icon">注册商图标</Label>
                <Select
                  value={editingDomain?.registrarIcon || ""}
                  onValueChange={(value) =>
                    setEditingDomain((prev) => (prev ? { ...prev, registrarIcon: value } : null))
                  }
                >
                  <SelectTrigger id="domain-registrar-icon">
                    <SelectValue placeholder="选择图标" />
                  </SelectTrigger>
                  <SelectContent>
                    {getRegistrarIcons().map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center">
                          <RegistrarIcon iconName={icon} className="h-4 w-4 mr-2" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain-registration-time">注册时间</Label>
                <Input
                  id="domain-registration-time"
                  type="date"
                  value={editingDomain?.registrationTime ? formatDate(editingDomain.registrationTime) : ""}
                  onChange={(e) =>
                    setEditingDomain((prev) => (prev ? { ...prev, registrationTime: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain-expiration-time">到期时间</Label>
                <Input
                  id="domain-expiration-time"
                  type="date"
                  value={editingDomain?.expirationTime ? formatDate(editingDomain.expirationTime) : ""}
                  onChange={(e) =>
                    setEditingDomain((prev) => (prev ? { ...prev, expirationTime: e.target.value } : null))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain-purchase-url">购买链接</Label>
              <Input
                id="domain-purchase-url"
                value={editingDomain?.purchaseUrl || ""}
                onChange={(e) =>
                  setEditingDomain((prev) => (prev ? { ...prev, purchaseUrl: e.target.value } : null))
                }
                placeholder="https://example.com/buy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDomain(false)}>
              取消
            </Button>
            <Button onClick={handleAddDomain}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量设置注册商对话框 */}
      <Dialog open={isBatchRegistrarDialogOpen} onOpenChange={setIsBatchRegistrarDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量设置注册商</DialogTitle>
            <DialogDescription>
              为选中的 {selectedDomains.length} 个域名设置同一个注册商
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="batch-registrar">注册商名称</Label>
              <Input
                id="batch-registrar"
                placeholder="阿里云"
                value={batchRegistrar}
                onChange={(e) => setBatchRegistrar(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-registrar-icon">注册商图标</Label>
              <Select value={batchRegistrarIcon} onValueChange={setBatchRegistrarIcon}>
                <SelectTrigger id="batch-registrar-icon">
                  <SelectValue placeholder="选择图标" />
                </SelectTrigger>
                <SelectContent>
                  {getRegistrarIcons().map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center">
                        <RegistrarIcon iconName={icon} className="h-4 w-4 mr-2" />
                        <span>{icon}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchRegistrarDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBatchUpdateRegistrar}>应用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

