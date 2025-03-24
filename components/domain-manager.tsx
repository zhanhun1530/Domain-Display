"use client"

import { useState } from "react"
import { useDomains } from "@/contexts/domain-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, RefreshCw } from "lucide-react"

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

  const [domainsJson, setDomainsJson] = useState(JSON.stringify(domains, null, 2))
  const [soldDomainsJson, setSoldDomainsJson] = useState(JSON.stringify(soldDomains, null, 2))
  const [friendlyLinksJson, setFriendlyLinksJson] = useState(JSON.stringify(friendlyLinks, null, 2))

  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">域名数据管理</h2>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          重置为默认值
        </Button>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">待售域名</TabsTrigger>
          <TabsTrigger value="sold">已售域名</TabsTrigger>
          <TabsTrigger value="links">友情链接</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>待售域名数据</CardTitle>
              <CardDescription>编辑JSON格式的域名数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono h-96"
                value={domainsJson}
                onChange={(e) => setDomainsJson(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveDomains}>保存域名数据</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <CardTitle>已售域名数据</CardTitle>
              <CardDescription>编辑JSON格式的已售域名数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono h-96"
                value={soldDomainsJson}
                onChange={(e) => setSoldDomainsJson(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSoldDomains}>保存已售域名数据</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>友情链接数据</CardTitle>
              <CardDescription>编辑JSON格式的友情链接数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono h-96"
                value={friendlyLinksJson}
                onChange={(e) => setFriendlyLinksJson(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFriendlyLinks}>保存友情链接数据</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

