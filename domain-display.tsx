"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function DomainDisplay() {
  const [domain, setDomain] = useState("example.com")

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <h1 className="text-2xl font-semibold mb-6">Domain Display</h1>

      <div className="w-full max-w-md mb-6">
        <div className="relative">
          <Input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="pr-10 text-center"
            placeholder="Enter domain name"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-center break-all">{domain}</h2>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

