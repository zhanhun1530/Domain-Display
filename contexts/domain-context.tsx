"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import defaultDomainsData from "@/data/domains.json"
import defaultSoldDomainsData from "@/data/sold-domains.json"
import defaultFriendlyLinksData from "@/data/friendly-links.json"

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

// 本地存储键
const DOMAINS_STORAGE_KEY = "domain-display-domains"
const SOLD_DOMAINS_STORAGE_KEY = "domain-display-sold-domains"
const FRIENDLY_LINKS_STORAGE_KEY = "domain-display-friendly-links"

// 从本地存储获取数据
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
  }

  return defaultValue
}

// 保存数据到本地存储
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function DomainProvider({ children }: { children: ReactNode }) {
  // 使用默认值初始化，避免null值
  const [domains, setDomains] = useState<Domain[]>(defaultDomainsData as Domain[])
  const [soldDomains, setSoldDomains] = useState<Domain[]>(defaultSoldDomainsData as Domain[])
  const [friendlyLinks, setFriendlyLinks] = useState<FriendlyLink[]>(defaultFriendlyLinksData as FriendlyLink[])

  // 从localStorage加载域名数据
  useEffect(() => {
    setDomains(getFromStorage(DOMAINS_STORAGE_KEY, defaultDomainsData as Domain[]))
    setSoldDomains(getFromStorage(SOLD_DOMAINS_STORAGE_KEY, defaultSoldDomainsData as Domain[]))
    setFriendlyLinks(getFromStorage(FRIENDLY_LINKS_STORAGE_KEY, defaultFriendlyLinksData as FriendlyLink[]))
  }, [])

  // 保存域名数据到localStorage
  useEffect(() => {
    saveToStorage(DOMAINS_STORAGE_KEY, domains)
  }, [domains])

  useEffect(() => {
    saveToStorage(SOLD_DOMAINS_STORAGE_KEY, soldDomains)
  }, [soldDomains])

  useEffect(() => {
    saveToStorage(FRIENDLY_LINKS_STORAGE_KEY, friendlyLinks)
  }, [friendlyLinks])

  const updateDomains = (newDomains: Domain[]) => {
    setDomains(newDomains)
  }

  const updateSoldDomains = (newSoldDomains: Domain[]) => {
    setSoldDomains(newSoldDomains)
  }

  const updateFriendlyLinks = (newFriendlyLinks: FriendlyLink[]) => {
    setFriendlyLinks(newFriendlyLinks)
  }

  const resetToDefaults = () => {
    setDomains(defaultDomainsData as Domain[])
    setSoldDomains(defaultSoldDomainsData as Domain[])
    setFriendlyLinks(defaultFriendlyLinksData as FriendlyLink[])
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

