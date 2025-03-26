"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { nanoid } from "nanoid"

interface FriendlyLink {
  id: string
  name: string
  url: string
  description: string
}

interface FriendlyLinkVisualEditorProps {
  friendlyLinks: FriendlyLink[]
  onSave: (friendlyLinks: FriendlyLink[]) => void
}

export function FriendlyLinkVisualEditor({ friendlyLinks, onSave }: FriendlyLinkVisualEditorProps) {
  const [editLinks, setEditLinks] = useState<FriendlyLink[]>(friendlyLinks)
  const [currentLink, setCurrentLink] = useState<FriendlyLink | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAdd = () => {
    // 创建新链接
    const newLink: FriendlyLink = {
      id: nanoid(),
      name: "",
      url: "https://",
      description: "",
    }
    setCurrentLink(newLink)
    setIsDialogOpen(true)
  }

  const handleEdit = (link: FriendlyLink) => {
    setCurrentLink({ ...link })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个友情链接吗？")) {
      const newLinks = editLinks.filter((link) => link.id !== id)
      setEditLinks(newLinks)
      onSave(newLinks)
    }
  }

  const handleSaveLink = () => {
    if (!currentLink) return

    // 验证必填字段
    if (!currentLink.name || !currentLink.url) {
      alert("请填写链接名称和URL")
      return
    }

    // 验证URL格式
    if (!isValidUrl(currentLink.url)) {
      alert("请输入有效的URL，例如 https://example.com")
      return
    }

    // 判断是新增还是编辑
    if (editLinks.find((l) => l.id === currentLink.id)) {
      // 编辑现有链接
      const newLinks = editLinks.map((link) => 
        link.id === currentLink.id ? currentLink : link
      )
      setEditLinks(newLinks)
      onSave(newLinks)
    } else {
      // 添加新链接
      const newLinks = [...editLinks, currentLink]
      setEditLinks(newLinks)
      onSave(newLinks)
    }

    setIsDialogOpen(false)
  }

  // 验证URL是否有效
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch (e) {
      return false
    }
  }

  // 格式化URL显示
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "")
    } catch (e) {
      return url
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="gap-1">
          <Plus className="h-4 w-4" />
          添加友情链接
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editLinks.length > 0 ? (
              editLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    {link.name}
                  </TableCell>
                  <TableCell>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                      {formatUrl(link.url)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={link.description}>
                    {link.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  暂无友情链接数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentLink && editLinks.find((l) => l.id === currentLink.id) ? "编辑友情链接" : "添加友情链接"}</DialogTitle>
            <DialogDescription>
              填写友情链接信息，所有标记 * 的字段为必填项
            </DialogDescription>
          </DialogHeader>
          
          {currentLink && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称 *</Label>
                <Input
                  id="name"
                  value={currentLink.name}
                  onChange={(e) => setCurrentLink({ ...currentLink, name: e.target.value })}
                  placeholder="链接名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder="https://example.com"
                />
                <p className="text-xs text-muted-foreground">
                  请输入完整URL，包括https://
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={currentLink.description}
                  onChange={(e) => setCurrentLink({ ...currentLink, description: e.target.value })}
                  placeholder="描述这个链接"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveLink}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 