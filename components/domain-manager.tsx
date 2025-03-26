"use client"

import { useState } from "react"
import { useDomains } from "@/contexts/domain-context"
import { useSite } from "@/contexts/site-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle2, RefreshCw, PencilLine, Table, Plus, Trash2 } from "lucide-react"
import { DomainVisualEditor } from "@/components/domain-visual-editor"
import { SoldDomainVisualEditor } from "@/components/sold-domain-visual-editor"
import { FriendlyLinkVisualEditor } from "@/components/friendly-link-visual-editor"

// 待售域名类型定义
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

// 已售域名类型定义
interface SoldDomain {
  id: string
  name: string
  extension: string
  status: "sold"
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
  } = useDomains()

  const {
    settings,
    addRegistrarIcon,
    updateRegistrarIcon,
    removeRegistrarIcon
  } = useSite()

  const [domainsJson, setDomainsJson] = useState(JSON.stringify(domains, null, 2))
  const [soldDomainsJson, setSoldDomainsJson] = useState(JSON.stringify(soldDomains, null, 2))
  const [friendlyLinksJson, setFriendlyLinksJson] = useState(JSON.stringify(friendlyLinks, null, 2))

  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual")

  // 图标管理相关状态
  const [newIconName, setNewIconName] = useState("")
  const [newIconSvg, setNewIconSvg] = useState("")
  const [isAddIconDialogOpen, setIsAddIconDialogOpen] = useState(false)
  const [editIconName, setEditIconName] = useState("")
  const [editIconSvg, setEditIconSvg] = useState("")
  const [isEditIconDialogOpen, setIsEditIconDialogOpen] = useState(false)

  const handleSaveDomains = () => {
    try {
      const parsedDomains = JSON.parse(domainsJson)
      updateDomains(parsedDomains)
      setSuccessMessage("域名数据已保存")
      setError("")
    } catch (err) {
      setError("JSON格式错误，请检查您的输入")
      setSuccessMessage("")
    }
  }

  const handleSaveSoldDomains = () => {
    try {
      const parsedSoldDomains = JSON.parse(soldDomainsJson)
      updateSoldDomains(parsedSoldDomains)
      setSuccessMessage("已售域名数据已保存")
      setError("")
    } catch (err) {
      setError("JSON格式错误，请检查您的输入")
      setSuccessMessage("")
    }
  }

  const handleSaveFriendlyLinks = () => {
    try {
      const parsedFriendlyLinks = JSON.parse(friendlyLinksJson)
      updateFriendlyLinks(parsedFriendlyLinks)
      setSuccessMessage("友情链接数据已保存")
      setError("")
    } catch (err) {
      setError("JSON格式错误，请检查您的输入")
      setSuccessMessage("")
    }
  }

  const handleReset = () => {
    if (confirm("确定要重置所有数据到默认值吗？")) {
      resetToDefaults()
      setDomainsJson(JSON.stringify(domains, null, 2))
      setSoldDomainsJson(JSON.stringify(soldDomains, null, 2))
      setFriendlyLinksJson(JSON.stringify(friendlyLinks, null, 2))
      setSuccessMessage("所有数据已重置为默认值")
      setError("")
    }
  }

  // 添加注册商图标
  const handleAddRegistrarIcon = () => {
    if (!newIconName.trim()) {
      setError("请输入注册商名称")
      setSuccessMessage("")
      return
    }

    if (!newIconSvg.trim()) {
      setError("请输入SVG代码")
      setSuccessMessage("")
      return
    }

    addRegistrarIcon(newIconName.trim(), newIconSvg.trim())
    setNewIconName("")
    setNewIconSvg("")
    setIsAddIconDialogOpen(false)
    setSuccessMessage("注册商图标已添加")
    setError("")
  }

  // 打开编辑图标对话框
  const openEditIconDialog = (name: string) => {
    setEditIconName(name)
    setEditIconSvg(settings.registrarIcons[name] || "")
    setIsEditIconDialogOpen(true)
  }

  // 更新注册商图标
  const handleUpdateRegistrarIcon = () => {
    if (!editIconSvg.trim()) {
      setError("请输入SVG代码")
      setSuccessMessage("")
      return
    }

    updateRegistrarIcon(editIconName, editIconSvg.trim())
    setIsEditIconDialogOpen(false)
    setSuccessMessage("注册商图标已更新")
    setError("")
  }

  // 删除注册商图标
  const handleRemoveRegistrarIcon = (name: string) => {
    if (confirm(`确定要删除 ${name} 的图标吗？`)) {
      removeRegistrarIcon(name)
      setSuccessMessage("注册商图标已删除")
      setError("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">域名数据管理</h2>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-lg p-1 flex">
            <Button
              variant={editorMode === "visual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setEditorMode("visual")}
              className="gap-1"
            >
              <Table className="h-4 w-4" />
              可视化编辑
            </Button>
            <Button
              variant={editorMode === "json" ? "default" : "ghost"}
              size="sm"
              onClick={() => setEditorMode("json")}
              className="gap-1"
            >
              <PencilLine className="h-4 w-4" />
              JSON编辑
            </Button>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置为默认值
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">待售域名</TabsTrigger>
          <TabsTrigger value="sold">已售域名</TabsTrigger>
          <TabsTrigger value="links">友情链接</TabsTrigger>
          <TabsTrigger value="registrar">注册商图标</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>待售域名数据</CardTitle>
              <CardDescription>
                {editorMode === "visual" ? "使用表格形式编辑域名数据" : "编辑JSON格式的域名数据"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editorMode === "visual" ? (
                <DomainVisualEditor 
                  domains={domains} 
                  onSave={(newDomains: Domain[]) => {
                    updateDomains(newDomains)
                    setDomainsJson(JSON.stringify(newDomains, null, 2))
                    setSuccessMessage("域名数据已保存")
                  }}
                />
              ) : (
                <Textarea
                  className="font-mono h-96"
                  value={domainsJson}
                  onChange={(e) => setDomainsJson(e.target.value)}
                />
              )}
            </CardContent>
            {editorMode === "json" && (
              <CardFooter>
                <Button onClick={handleSaveDomains}>保存域名数据</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <CardTitle>已售域名数据</CardTitle>
              <CardDescription>
                {editorMode === "visual" ? "使用表格形式编辑已售域名数据" : "编辑JSON格式的已售域名数据"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editorMode === "visual" ? (
                <SoldDomainVisualEditor 
                  soldDomains={soldDomains as SoldDomain[]} 
                  onSave={(newSoldDomains: SoldDomain[]) => {
                    updateSoldDomains(newSoldDomains as any[])
                    setSoldDomainsJson(JSON.stringify(newSoldDomains, null, 2))
                    setSuccessMessage("已售域名数据已保存")
                  }}
                />
              ) : (
                <Textarea
                  className="font-mono h-96"
                  value={soldDomainsJson}
                  onChange={(e) => setSoldDomainsJson(e.target.value)}
                />
              )}
            </CardContent>
            {editorMode === "json" && (
              <CardFooter>
                <Button onClick={handleSaveSoldDomains}>保存已售域名数据</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>友情链接数据</CardTitle>
              <CardDescription>
                {editorMode === "visual" ? "使用表格形式编辑友情链接数据" : "编辑JSON格式的友情链接数据"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editorMode === "visual" ? (
                <FriendlyLinkVisualEditor 
                  friendlyLinks={friendlyLinks} 
                  onSave={(newFriendlyLinks: FriendlyLink[]) => {
                    updateFriendlyLinks(newFriendlyLinks)
                    setFriendlyLinksJson(JSON.stringify(newFriendlyLinks, null, 2))
                    setSuccessMessage("友情链接数据已保存")
                  }}
                />
              ) : (
                <Textarea
                  className="font-mono h-96"
                  value={friendlyLinksJson}
                  onChange={(e) => setFriendlyLinksJson(e.target.value)}
                />
              )}
            </CardContent>
            {editorMode === "json" && (
              <CardFooter>
                <Button onClick={handleSaveFriendlyLinks}>保存友情链接数据</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="registrar">
          <Card>
            <CardHeader>
              <CardTitle>注册商图标</CardTitle>
              <CardDescription>管理域名注册商的SVG图标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isAddIconDialogOpen} onOpenChange={setIsAddIconDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      添加注册商图标
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加注册商图标</DialogTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {Object.entries(settings.registrarIcons).map(([name, svg]) => (
                  <Card key={name} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditIconDialog(name)}>
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

              {Object.keys(settings.registrarIcons).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">暂无注册商图标</p>
                </div>
              )}

              <Dialog open={isEditIconDialogOpen} onOpenChange={setIsEditIconDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>编辑注册商图标</DialogTitle>
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
      </Tabs>
    </div>
  )
}

