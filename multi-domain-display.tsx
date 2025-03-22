"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, CheckCircle2, ExternalLink, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RegistrarIcon } from "@/components/registrar-icon"

// 导入JSON数据
import domainsData from "@/data/domains.json"
import soldDomainsData from "@/data/sold-domains.json"
import friendlyLinksData from "@/data/friendly-links.json"

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

interface FriendlyLink {
  id: string
  name: string
  url: string
  description: string
}

export default function MultiDomainDisplay() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [soldDomains, setSoldDomains] = useState<Domain[]>([])
  const [friendlyLinks, setFriendlyLinks] = useState<FriendlyLink[]>([])

  // 加载数据
  useEffect(() => {
    setDomains(domainsData)
    setSoldDomains(soldDomainsData)
    setFriendlyLinks(friendlyLinksData)
  }, [])

  // Function to format date in a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-4">域名展示</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">管理和展示您的域名集合</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {domains.map((domain) => (
          <Card key={domain.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <RegistrarIcon iconName={domain.registrarIcon} className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">{domain.registrar || "未知商家"}</span>
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
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full ${domain.status === "active" ? "bg-green-500" : "bg-amber-500"} mr-2`}
                    ></div>
                    <span className="text-sm text-muted-foreground">待出售</span>
                  </div>
                  {domain.status === "available" && domain.purchaseUrl && (
                    <Button size="sm" className="h-8" asChild>
                      <a href={domain.purchaseUrl} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        购买
                      </a>
                    </Button>
                  )}
                  {domain.status === "available" && !domain.purchaseUrl && (
                    <Button size="sm" className="h-8">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      购买
                    </Button>
                  )}
                  {domain.status === "active" && (
                    <Button size="sm" variant="outline" className="h-8">
                      管理
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {domains.length === 0 && (
        <div className="text-center py-12 mb-12">
          <p className="text-muted-foreground">暂无域名显示</p>
        </div>
      )}

      {/* Sold Domains Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">已售域名</h2>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {soldDomains.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无已售域名</p>
          </div>
        )}
      </div>

      {/* Friendly Links Section */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">友情链接</h2>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendlyLinks.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="overflow-hidden h-full transition-colors hover:border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{link.name}</h3>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {friendlyLinks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无友情链接</p>
          </div>
        )}
      </div>
    </div>
  )
}

