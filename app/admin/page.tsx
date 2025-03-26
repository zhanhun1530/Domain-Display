"use client"

import { useState, useEffect } from "react"
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

export default function AdminPage() {
  const router = useRouter()
  const { securityQuestion, setSecurityQuestion, setSecurityAnswer } = useSite()
  const [question, setQuestion] = useState(securityQuestion)
  const [answer, setAnswer] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [securityCode, setSecurityCode] = useState("")
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedSecurityCode = localStorage.getItem("securityCode")
    if (savedSecurityCode) {
      setSecurityCode(savedSecurityCode)
    }
  }, [])

  const handleLogout = () => {
    router.push("/admin/login")
  }

  const handleSaveSecurity = () => {
    if (!question || !answer) {
      alert("请填写完整的安全问题和答案")
      return
    }

    setSecurityQuestion(question)
    setSecurityAnswer(answer)
    setShowPasswordDialog(false)
    alert("安全问题设置成功")
  }

  const handleSaveSecurityCode = () => {
    if (!securityCode) {
      alert("请输入安全码")
      return
    }

    localStorage.setItem("securityCode", securityCode)
    setShowSecurityDialog(false)
    alert("安全码设置成功")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
            <div className="flex space-x-4">
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">密码管理</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>设置安全问题</DialogTitle>
                    <DialogDescription>设置安全问题用于重置密码</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-question">安全问题</Label>
                      <Input
                        id="security-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="例如：您的出生地是？"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="security-answer">安全问题答案</Label>
                      <Input
                        id="security-answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="请输入答案"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveSecurity}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">安全码设置</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>设置安全码</DialogTitle>
                    <DialogDescription>设置安全码用于重置密码</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-code">安全码</Label>
                      <Input
                        id="security-code"
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        placeholder="请输入安全码"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSecurityDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveSecurityCode}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>

          {/* 其他控制台内容 */}
        </div>
      </div>
    </div>
  )
} 