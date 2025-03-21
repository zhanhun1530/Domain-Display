"use client"

import { useState } from "react"
import { Globe, ShoppingCart, X, CheckCircle2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Domain {
  id: string
  name: string
  extension: string
  status: "active" | "available" | "sold"
  soldTo?: string
  soldDate?: string
  isFavorite?: boolean
}

export default function MultiDomainDisplay() {
  const [domains, setDomains] = useState<Domain[]>([
    { id: "1", name: "example", extension: ".com", status: "active", isFavorite: false },
    { id: "2", name: "mywebsite", extension: ".org", status: "available", isFavorite: false },
    { id: "3", name: "coolproject", extension: ".io", status: "available", isFavorite: true },
    { id: "4", name: "portfolio", extension: ".dev", status: "active", isFavorite: false },
    { id: "5", name: "business", extension: ".co", status: "available", isFavorite: true },
    { id: "6", name: "blog", extension: ".net", status: "available", isFavorite: false },
  ])

  const [soldDomains, setSoldDomains] = useState<Domain[]>([
    {
      id: "s1",
      name: "premium",
      extension: ".com",
      status: "sold",
      soldTo: "科技解决方案公司",
      soldDate: "2025-02-15",
      isFavorite: false,
    },
    {
      id: "s2",
      name: "digital",
      extension: ".io",
      status: "sold",
      soldTo: "创意代理公司",
      soldDate: "2025-01-20",
      isFavorite: true,
    },
    {
      id: "s3",
      name: "ecommerce",
      extension: ".store",
      status: "sold",
      soldTo: "在线零售有限公司",
      soldDate: "2024-12-10",
      isFavorite: false,
    },
  ])

  const removeDomain = (id: string) => {
    setDomains(domains.filter((domain) => domain.id !== id))
  }

  const toggleFavorite = (id: string) => {
    setDomains(domains.map((domain) => (domain.id === id ? { ...domain, isFavorite: !domain.isFavorite } : domain)))
  }

  const toggleSoldFavorite = (id: string) => {
    setSoldDomains(
      soldDomains.map((domain) => (domain.id === id ? { ...domain, isFavorite: !domain.isFavorite } : domain)),
    )
  }

  // Function to format date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
  }

  // Get favorite domains from both active/available and sold domains
  const favoriteDomains = [
    ...domains.filter((domain) => domain.isFavorite),
    ...soldDomains.filter((domain) => domain.isFavorite),
  ]

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
                  <Globe className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">域名 {domain.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => toggleFavorite(domain.id)}
                  >
                    {domain.isFavorite ? (
                      <Heart className="h-4 w-4 fill-primary text-primary" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                    <span className="sr-only">{domain.isFavorite ? "取消收藏" : "添加收藏"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDomain(domain.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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
                    <span className="text-sm text-muted-foreground">
                      {domain.status === "active" ? "已激活" : "非卖"}
                    </span>
                  </div>
                  {domain.status === "available" && (
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => toggleSoldFavorite(domain.id)}
                    >
                      {domain.isFavorite ? (
                        <Heart className="h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      <span className="sr-only">{domain.isFavorite ? "取消收藏" : "添加收藏"}</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {domain.soldDate && formatDate(domain.soldDate)}
                    </span>
                  </div>
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

      {/* Favorite Domains Section */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">收藏域名</h2>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteDomains.map((domain) => (
            <Card key={domain.id} className="overflow-hidden border-primary/20 bg-primary/5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center">
                    {domain.status === "sold" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <Globe className="h-5 w-5 text-muted-foreground mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {domain.status === "sold" ? "已售出" : domain.status === "active" ? "已激活" : "非卖"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                    {domain.status === "sold" && domain.soldDate && (
                      <span className="text-xs text-muted-foreground">{formatDate(domain.soldDate)}</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1">
                    <span className="text-foreground">{domain.name}</span>
                    <span className="text-muted-foreground">{domain.extension}</span>
                  </h2>
                  <div className="mt-4">
                    {domain.status === "sold" && domain.soldTo && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">购买方：</span>
                        <span className="text-sm font-medium">{domain.soldTo}</span>
                      </div>
                    )}
                    {domain.status === "available" && (
                      <div className="flex justify-end">
                        <Button size="sm" className="h-8">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          购买
                        </Button>
                      </div>
                    )}
                    {domain.status === "active" && (
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" className="h-8">
                          管理
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {favoriteDomains.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无收藏域名。点击心形图标将域名添加到收藏。</p>
          </div>
        )}
      </div>
    </div>
  )
}

