"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus } from "lucide-react"
import { nanoid } from "nanoid"

interface SoldDomain {
  id: string
  name: string
  extension: string
  status: "sold"
  soldTo?: string
  soldDate?: string
}

interface SoldDomainVisualEditorProps {
  soldDomains: SoldDomain[]
  onSave: (soldDomains: SoldDomain[]) => void
}

export function SoldDomainVisualEditor({ soldDomains, onSave }: SoldDomainVisualEditorProps) {
  const [editDomains, setEditDomains] = useState<SoldDomain[]>(soldDomains)
  const [currentDomain, setCurrentDomain] = useState<SoldDomain | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 可用的域名后缀
  const availableExtensions = [".com", ".org", ".net", ".io", ".dev", ".co", ".app", ".store", ".tech", ".online", ".site", ".xyz"]

  const handleAdd = () => {
    // 创建新域名
    const newDomain: SoldDomain = {
      id: nanoid(),
      name: "",
      extension: ".com",
      status: "sold",
      soldTo: "",
      soldDate: new Date().toISOString().split("T")[0],
    }
    setCurrentDomain(newDomain)
    setIsDialogOpen(true)
  }

  const handleEdit = (domain: SoldDomain) => {
    setCurrentDomain({ ...domain })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个已售域名吗？")) {
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

    // 判断是新增还是编辑
    if (editDomains.find((d) => d.id === currentDomain.id)) {
      // 编辑现有域名
      const newDomains = editDomains.map((domain) => 
        domain.id === currentDomain.id ? currentDomain : domain
      )
      setEditDomains(newDomains)
      onSave(newDomains)
    } else {
      // 添加新域名
      const newDomains = [...editDomains, currentDomain]
      setEditDomains(newDomains)
      onSave(newDomains)
    }

    setIsDialogOpen(false)
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-1">
          <Plus className="h-4 w-4" />
          添加已售域名
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>域名</TableHead>
              <TableHead>购买方</TableHead>
              <TableHead>售出时间</TableHead>
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
                  <TableCell>{domain.soldTo}</TableCell>
                  <TableCell>{formatDate(domain.soldDate)}</TableCell>
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
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  暂无已售域名数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentDomain && editDomains.find((d) => d.id === currentDomain.id) ? "编辑已售域名" : "添加已售域名"}</DialogTitle>
            <DialogDescription>
              填写已售域名信息，所有标记 * 的字段为必填项
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="soldTo">购买方</Label>
                <Input
                  id="soldTo"
                  value={currentDomain.soldTo}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, soldTo: e.target.value })}
                  placeholder="公司名称或个人"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="soldDate">售出时间</Label>
                <Input
                  id="soldDate"
                  type="date"
                  value={currentDomain.soldDate}
                  onChange={(e) => setCurrentDomain({ ...currentDomain, soldDate: e.target.value })}
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