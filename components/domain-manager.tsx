"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSite } from "@/contexts/site-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useDomains } from "@/contexts/domain-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Globe,
  Calendar,
  ShoppingCart,
} from "lucide-react"
import { RegistrarIcon } from "@/components/registrar-icon"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

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
  const router = useRouter()
  const { securityQuestion, setSecurityQuestion, setSecurityAnswer } = useSite()
  const [question, setQuestion] = useState(securityQuestion)
  const [answer, setAnswer] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [securityCode, setSecurityCode] = useState(localStorage.getItem("securityCode") || "")
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const { domains, soldDomains, friendlyLinks, updateDomains, updateSoldDomains, updateFriendlyLinks, resetToDefaults } = useDomains()
  const [newDomain, setNewDomain] = useState({
    name: "",
    extension: "",
    status: "active" as const,
    registrar: "",
    registrarIcon: "",
    registrationTime: "",
    expirationTime: "",
    purchaseUrl: "",
  })
  const [editingSoldDomain, setEditingSoldDomain] = useState<Domain | null>(null)
  const [newSoldDomain, setNewSoldDomain] = useState({
    name: "",
    extension: "",
    status: "sold" as const,
    registrar: "",
    registrarIcon: "",
    registrationTime: "",
    expirationTime: "",
    purchaseUrl: "",
    soldTo: "",
    soldDate: "",
  })
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [isAddingSoldDomain, setIsAddingSoldDomain] = useState(false)
  const [isAddingFriendlyLink, setIsAddingFriendlyLink] = useState(false)
  const [newFriendlyLink, setNewFriendlyLink] = useState({
    name: "",
    url: "",
    description: "",
  })

  const {
    settings,
    addRegistrarIcon,
    updateRegistrarIcon,
    removeRegistrarIcon,
  } = useSite()

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 域名编辑状态
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)

  // 友情链接编辑状态
  const [editingLink, setEditingLink] = useState<FriendlyLink | null>(null)

  // 添加注册商相关的状态变量
  const [registrarIcons, setRegistrarIcons] = useState<{ [key: string]: string }>(settings.registrarIcons)
  const [registrarNames, setRegistrarNames] = useState<{ [key: string]: string }>(settings.registrarNames)
  const [newRegistrarName, setNewRegistrarName] = useState("")
  const [newRegistrarDisplayName, setNewRegistrarDisplayName] = useState("")
  const [newRegistrarIcon, setNewRegistrarIcon] = useState("")
  const [editingRegistrar, setEditingRegistrar] = useState<string | null>(null)
  const [editRegistrarName, setEditRegistrarName] = useState("")
  const [editRegistrarDisplayName, setEditRegistrarDisplayName] = useState("")
  const [editRegistrarIcon, setEditRegistrarIcon] = useState("")

  // 添加域名统计状态
  const [domainStats, setDomainStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
  })

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
    if (!newDomain.name || !newDomain.extension) {
      toast.error("请填写域名和扩展名")
      return
    }

    const domain = {
      id: `${newDomain.name}.${newDomain.extension}`,
      ...newDomain,
    }

    updateDomains([...domains, domain])
    setIsAddingDomain(false)
    setNewDomain({
      name: "",
      extension: "",
      status: "active",
      registrar: "",
      registrarIcon: "",
      registrationTime: "",
      expirationTime: "",
      purchaseUrl: "",
    })
    toast.success("域名添加成功")
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
    if (!newSoldDomain.name || !newSoldDomain.extension) {
      toast.error("请填写域名和扩展名")
      return
    }

    const domain = {
      id: `${newSoldDomain.name}.${newSoldDomain.extension}`,
      ...newSoldDomain,
    }

    updateSoldDomains([...soldDomains, domain])
    setIsAddingSoldDomain(false)
    setNewSoldDomain({
      name: "",
      extension: "",
      status: "sold",
      registrar: "",
      registrarIcon: "",
      registrationTime: "",
      expirationTime: "",
      purchaseUrl: "",
      soldTo: "",
      soldDate: "",
    })
    toast.success("已售出域名添加成功")
  }

  // 更新已售域名
  const handleUpdateSoldDomain = () => {
    if (!editingSoldDomain) return

    if (!editingSoldDomain.name || !editingSoldDomain.extension) {
      showErrorMessage("域名和后缀不能为空")
      return
    }

    const updatedSoldDomains = soldDomains.map((domain) =>
      domain.id === editingSoldDomain.id ? editingSoldDomain : domain
    )

    updateSoldDomains(updatedSoldDomains)
    setEditingSoldDomain(null)
    showSuccessMessage("已售域名已更新")
  }

  // 删除已售域名
  const handleDeleteSoldDomain = (id: string) => {
    if (confirm("确定要删除这个已售域名吗？")) {
      const updatedSoldDomains = soldDomains.filter((domain) => domain.id !== id)
      updateSoldDomains(updatedSoldDomains)
      showSuccessMessage("已售域名已删除")
    }
  }

  // 添加友情链接
  const handleAddFriendlyLink = () => {
    if (!newFriendlyLink.name || !newFriendlyLink.url) {
      toast.error("请填写名称和链接")
      return
    }

    const link = {
      id: newFriendlyLink.name.toLowerCase().replace(/\s+/g, "-"),
      ...newFriendlyLink,
    }

    updateFriendlyLinks([...friendlyLinks, link])
    setIsAddingFriendlyLink(false)
    setNewFriendlyLink({
      name: "",
      url: "",
      description: "",
    })
    toast.success("友情链接添加成功")
  }

  // 更新友情链接
  const handleUpdateLink = () => {
    if (!editingLink) return

    if (!editingLink.name || !editingLink.url) {
      showErrorMessage("名称和URL不能为空")
      return
    }

    const updatedLinks = friendlyLinks.map((link) =>
      link.id === editingLink.id ? editingLink : link
    )

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

  // 获取注册商图标
  const getRegistrarIcons = () => {
    return registrarIcons
  }

  // 添加注册商图标
  const handleAddRegistrarIcon = () => {
    if (!newRegistrarName || !newRegistrarDisplayName || !newRegistrarIcon) {
      showErrorMessage("注册商名称、显示名称和图标不能为空")
      return
    }

    addRegistrarIcon(newRegistrarName, newRegistrarDisplayName, newRegistrarIcon)
    setNewRegistrarName("")
    setNewRegistrarDisplayName("")
    setNewRegistrarIcon("")
    showSuccessMessage("注册商图标已添加")
  }

  // 开始编辑注册商图标
  const handleStartEdit = (name: string) => {
    setEditingRegistrar(name)
    setEditRegistrarName(name)
    setEditRegistrarDisplayName(registrarNames[name] || "")
    setEditRegistrarIcon(registrarIcons[name] || "")
  }

  // 保存编辑的注册商图标
  const handleSaveEdit = () => {
    if (!editingRegistrar || !editRegistrarDisplayName || !editRegistrarIcon) {
      showErrorMessage("注册商名称、显示名称和图标不能为空")
      return
    }

    updateRegistrarIcon(editingRegistrar, editRegistrarDisplayName, editRegistrarIcon)
    setEditingRegistrar(null)
    showSuccessMessage("注册商图标已更新")
  }

  // 删除注册商图标
  const handleDeleteRegistrarIcon = (name: string) => {
    if (confirm("确定要删除这个注册商图标吗？")) {
      removeRegistrarIcon(name)
      showSuccessMessage("注册商图标已删除")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">域名管理</h2>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">当前域名数量：{domains.length}</p>
            </div>
            <Dialog open={isAddingDomain} onOpenChange={setIsAddingDomain}>
              <DialogTrigger asChild>
                <Button>添加域名</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加新域名</DialogTitle>
                  <DialogDescription>填写域名信息</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domain-name">域名</Label>
                    <Input
                      id="domain-name"
                      value={newDomain.name}
                      onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-extension">扩展名</Label>
                    <Input
                      id="domain-extension"
                      value={newDomain.extension}
                      onChange={(e) => setNewDomain({ ...newDomain, extension: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-registrar">注册商</Label>
                    <Input
                      id="domain-registrar"
                      value={newDomain.registrar}
                      onChange={(e) => setNewDomain({ ...newDomain, registrar: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-registrar-icon">注册商图标</Label>
                    <Input
                      id="domain-registrar-icon"
                      value={newDomain.registrarIcon}
                      onChange={(e) => setNewDomain({ ...newDomain, registrarIcon: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-registration-time">注册时间</Label>
                    <Input
                      id="domain-registration-time"
                      type="datetime-local"
                      value={newDomain.registrationTime}
                      onChange={(e) => setNewDomain({ ...newDomain, registrationTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-expiration-time">到期时间</Label>
                    <Input
                      id="domain-expiration-time"
                      type="datetime-local"
                      value={newDomain.expirationTime}
                      onChange={(e) => setNewDomain({ ...newDomain, expirationTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="domain-purchase-url">购买链接</Label>
                    <Input
                      id="domain-purchase-url"
                      value={newDomain.purchaseUrl}
                      onChange={(e) => setNewDomain({ ...newDomain, purchaseUrl: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddDomain}>添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">已售出域名管理</h2>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已售出域名数量：{soldDomains.length}</p>
            </div>
            <Dialog open={isAddingSoldDomain} onOpenChange={setIsAddingSoldDomain}>
              <DialogTrigger asChild>
                <Button>添加已售出域名</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加已售出域名</DialogTitle>
                  <DialogDescription>填写已售出域名信息</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-name">域名</Label>
                    <Input
                      id="sold-domain-name"
                      value={newSoldDomain.name}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-extension">扩展名</Label>
                    <Input
                      id="sold-domain-extension"
                      value={newSoldDomain.extension}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, extension: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-registrar">注册商</Label>
                    <Input
                      id="sold-domain-registrar"
                      value={newSoldDomain.registrar}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, registrar: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-registrar-icon">注册商图标</Label>
                    <Input
                      id="sold-domain-registrar-icon"
                      value={newSoldDomain.registrarIcon}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, registrarIcon: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-registration-time">注册时间</Label>
                    <Input
                      id="sold-domain-registration-time"
                      type="datetime-local"
                      value={newSoldDomain.registrationTime}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, registrationTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-expiration-time">到期时间</Label>
                    <Input
                      id="sold-domain-expiration-time"
                      type="datetime-local"
                      value={newSoldDomain.expirationTime}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, expirationTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-purchase-url">购买链接</Label>
                    <Input
                      id="sold-domain-purchase-url"
                      value={newSoldDomain.purchaseUrl}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, purchaseUrl: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-sold-to">售出对象</Label>
                    <Input
                      id="sold-domain-sold-to"
                      value={newSoldDomain.soldTo}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, soldTo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-domain-sold-date">售出日期</Label>
                    <Input
                      id="sold-domain-sold-date"
                      type="date"
                      value={newSoldDomain.soldDate}
                      onChange={(e) => setNewSoldDomain({ ...newSoldDomain, soldDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSoldDomain}>添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">友情链接管理</h2>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">友情链接数量：{friendlyLinks.length}</p>
            </div>
            <Dialog open={isAddingFriendlyLink} onOpenChange={setIsAddingFriendlyLink}>
              <DialogTrigger asChild>
                <Button>添加友情链接</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加友情链接</DialogTitle>
                  <DialogDescription>填写友情链接信息</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="friendly-link-name">名称</Label>
                    <Input
                      id="friendly-link-name"
                      value={newFriendlyLink.name}
                      onChange={(e) => setNewFriendlyLink({ ...newFriendlyLink, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="friendly-link-url">链接</Label>
                    <Input
                      id="friendly-link-url"
                      value={newFriendlyLink.url}
                      onChange={(e) => setNewFriendlyLink({ ...newFriendlyLink, url: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="friendly-link-description">描述</Label>
                    <Textarea
                      id="friendly-link-description"
                      value={newFriendlyLink.description}
                      onChange={(e) => setNewFriendlyLink({ ...newFriendlyLink, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFriendlyLink}>添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

