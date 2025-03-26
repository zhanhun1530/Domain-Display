"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

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
}

interface DomainVisualEditorProps {
  domains: Domain[]
  onSave: (domains: Domain[]) => void
}

export function DomainVisualEditor({ domains, onSave }: DomainVisualEditorProps) {
  const [editDomains, setEditDomains] = useState<Domain[]>(domains)
  const [currentDomain, setCurrentDomain] = useState<Domain | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 可用的域名后缀
  const availableExtensions = [".com", ".org", ".net", ".io", ".dev", ".co", ".app", ".store", ".tech", ".online", ".site", ".xyz"]
  
  // 可用的域名注册商
  const availableRegistrars = [
    { name: "阿里云", icon: "aliyun" },
    { name: "腾讯云", icon: "tencent" },
    { name: "华为云", icon: "huawei" },
    { name: "GoDaddy", icon: "godaddy" },
    { name: "Namecheap", icon: "namecheap" },
  ]

  const handleAdd = () => {
    // 创建新域名
    const newDomain: Domain = {
      id: uuidv4(),
      name: "",
      extension: ".com",
      status: "available",
      registrar: "阿里云",
      registrarIcon: "aliyun",
      registrationTime: new Date().toISOString().split("T")[0],
      expirationTime: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
      purchaseUrl: "",
    }
    setCurrentDomain(newDomain)
    setIsDialogOpen(true)
  }

  const handleEdit = (domain: Domain) => {
    setCurrentDomain({ ...domain })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个域名吗？")) {
      const newDomains = editDomains.filter((domain) => domain.id !== id)
      setEditDomains(newDomains)
      onSave(newDomains)
    }
  }

  const handleSaveDomain = () => {
    if (!currentDomain) return

    // 验证必填字段
    if (!currentDomain.name || !currentDomain.extension) {
      alert("请填写域名名称和后缀")
      return
    }

    // 确保域名后缀以点开头
    let extension = currentDomain.extension
    if (extension && !extension.startsWith(".")) {
      extension = "." + extension
    }
    
    const updatedDomain = {
      ...currentDomain,
      extension
    }

    // 判断是新增还是编辑
    if (editDomains.find((d) => d.id === currentDomain.id)) {
      // 编辑现有域名
      const newDomains = editDomains.map((domain) => 
        domain.id === currentDomain.id ? updatedDomain : domain
      )
      setEditDomains(newDomains)
      onSave(newDomains)
    } else {
      // 添加新域名
      const newDomains = [...editDomains, updatedDomain]
      setEditDomains(newDomains)
      onSave(newDomains)
    }

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-1">
          <Plus className="h-4 w-4" />
          添加域名
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>域名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册商</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>到期时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editDomains.length > 0 ? (
              editDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">
                    {domain.name}{domain.extension}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${domain.status === "active" ? "bg-green-500" : "bg-amber-500"}`}></div>
                      <span>{domain.status === "active" ? "已激活" : "待出售"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{domain.registrar}</TableCell>
                  <TableCell>{domain.registrationTime}</TableCell>
                  <TableCell>{domain.expirationTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(domain)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(domain.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  暂无域名数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentDomain && editDomains.find((d) => d.id === currentDomain.id) ? "编辑域名" : "添加域名"}</DialogTitle>
            <DialogDescription>
              填写域名信息，所有标记 * 的字段为必填项
            </DialogDescription>
          </DialogHeader>
          
          {currentDomain && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">域名名称 *</Label>
                <Input
                  id="name"
                  value={currentDomain.name}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, name: e.target.value })}
                  placeholder="example"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extension">域名后缀 *</Label>
                <Input
                  id="extension"
                  value={currentDomain.extension}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, extension: e.target.value })}
                  placeholder=".com"
                  list="extensions"
                />
                <datalist id="extensions">
                  {availableExtensions.map((ext) => (
                    <option key={ext} value={ext} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  可自定义后缀，请确保包含前导点（如 .com）
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">状态 *</Label>
                <Select
                  value={currentDomain.status}
                  onValueChange={(value: "active" | "available") => 
                    setCurrentDomain({ ...currentDomain, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">已激活</SelectItem>
                    <SelectItem value="available">待出售</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrar">注册商</Label>
                <Select
                  value={currentDomain.registrar}
                  onValueChange={(value) => {
                    const registrar = availableRegistrars.find((r) => r.name === value)
                    setCurrentDomain({ 
                      ...currentDomain, 
                      registrar: value,
                      registrarIcon: registrar?.icon
                    })
                  }}
                >
                  <SelectTrigger id="registrar">
                    <SelectValue placeholder="选择注册商" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRegistrars.map((registrar) => (
                      <SelectItem key={registrar.name} value={registrar.name}>
                        {registrar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationTime">注册时间</Label>
                <Input
                  id="registrationTime"
                  type="date"
                  value={currentDomain.registrationTime}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, registrationTime: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expirationTime">到期时间</Label>
                <Input
                  id="expirationTime"
                  type="date"
                  value={currentDomain.expirationTime}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, expirationTime: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="purchaseUrl">购买链接</Label>
                <Input
                  id="purchaseUrl"
                  value={currentDomain.purchaseUrl}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, purchaseUrl: e.target.value })}
                  placeholder="https://example.com/buy"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveDomain}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 