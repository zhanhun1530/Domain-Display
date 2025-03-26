"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import defaultDomainsData from "@/data/domains.json"
import defaultSoldDomainsData from "@/data/sold-domains.json"
import defaultFriendlyLinksData from "@/data/friendly-links.json"
import {
  getAllDomains,
  getAllSoldDomains,
  getAllFriendlyLinks,
  insertDomain,
  insertSoldDomain,
  insertFriendlyLink,
  deleteDomain,
  deleteSoldDomain,
  deleteFriendlyLink,
} from "@/lib/db"

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

interface DomainContextType {
  domains: Domain[]
  soldDomains: Domain[]
  friendlyLinks: FriendlyLink[]
  updateDomains: (newDomains: Domain[]) => void
  updateSoldDomains: (newSoldDomains: Domain[]) => void
  updateFriendlyLinks: (newFriendlyLinks: FriendlyLink[]) => void
  resetToDefaults: () => void
}

// 创建上下文，提供默认值避免null检查
const DomainContext = createContext<DomainContextType>({
  domains: defaultDomainsData as Domain[],
  soldDomains: defaultSoldDomainsData as Domain[],
  friendlyLinks: defaultFriendlyLinksData as FriendlyLink[],
  updateDomains: () => {},
  updateSoldDomains: () => {},
  updateFriendlyLinks: () => {},
  resetToDefaults: () => {},
})

export function DomainProvider({ children }: { children: ReactNode }) {
  // 使用默认值初始化，避免null值
  const [domains, setDomains] = useState<Domain[]>(defaultDomainsData as Domain[])
  const [soldDomains, setSoldDomains] = useState<Domain[]>(defaultSoldDomainsData as Domain[])
  const [friendlyLinks, setFriendlyLinks] = useState<FriendlyLink[]>(defaultFriendlyLinksData as FriendlyLink[])

  // 从数据库加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/domains')
        const data = await response.json()
        
        if (data.domains?.length > 0) {
          setDomains(data.domains)
        }
        if (data.soldDomains?.length > 0) {
          setSoldDomains(data.soldDomains)
        }
        if (data.friendlyLinks?.length > 0) {
          setFriendlyLinks(data.friendlyLinks)
        }
      } catch (error) {
        console.error("Error loading data from database:", error)
      }
    }

    loadData()
  }, [])

  const updateDomains = async (newDomains: Domain[]) => {
    try {
      // 更新数据库
      await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domains: newDomains }),
      })

      // 更新状态
      setDomains(newDomains)
    } catch (error) {
      console.error("Error updating domains:", error)
    }
  }

  const updateSoldDomains = async (newSoldDomains: Domain[]) => {
    try {
      // 更新数据库
      await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ soldDomains: newSoldDomains }),
      })

      // 更新状态
      setSoldDomains(newSoldDomains)
    } catch (error) {
      console.error("Error updating sold domains:", error)
    }
  }

  const updateFriendlyLinks = async (newFriendlyLinks: FriendlyLink[]) => {
    try {
      // 更新数据库
      await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendlyLinks: newFriendlyLinks }),
      })

      // 更新状态
      setFriendlyLinks(newFriendlyLinks)
    } catch (error) {
      console.error("Error updating friendly links:", error)
    }
  }

  const resetToDefaults = async () => {
    try {
      // 重置数据库
      await fetch('/api/domains/reset', {
        method: 'POST',
      })

      // 重置状态
      setDomains(defaultDomainsData as Domain[])
      setSoldDomains(defaultSoldDomainsData as Domain[])
      setFriendlyLinks(defaultFriendlyLinksData as FriendlyLink[])
    } catch (error) {
      console.error("Error resetting to defaults:", error)
    }
  }

  const contextValue = {
    domains,
    soldDomains,
    friendlyLinks,
    updateDomains,
    updateSoldDomains,
    updateFriendlyLinks,
    resetToDefaults,
  }

  return <DomainContext.Provider value={contextValue}>{children}</DomainContext.Provider>
}

export function useDomains() {
  return useContext(DomainContext)
}

