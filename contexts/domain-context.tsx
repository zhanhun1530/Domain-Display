"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { fetchData, saveData } from "@/lib/data-service"
import defaultDomainsDataRaw from "@/data/domains.json"
import defaultSoldDomainsDataRaw from "@/data/sold-domains.json"
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
  isLoading: boolean
  saveToServer: () => Promise<boolean>
}

// 数据文件名常量
const DOMAINS_FILENAME = "domains.json"
const SOLD_DOMAINS_FILENAME = "sold-domains.json"
const FRIENDLY_LINKS_FILENAME = "friendly-links.json"

// 本地存储键
const DOMAINS_STORAGE_KEY = "domain-display-domains"
const SOLD_DOMAINS_STORAGE_KEY = "domain-display-sold-domains"
const FRIENDLY_LINKS_STORAGE_KEY = "domain-display-friendly-links"

// 转换默认域名数据以符合Domain类型
const defaultDomainsData: Domain[] = defaultDomainsDataRaw.map(item => ({
  ...item,
  status: (item.status as string).toLowerCase() === "available" ? "available" :
         (item.status as string).toLowerCase() === "sold" ? "sold" : "active"
} as Domain));

// 转换默认已售域名数据以符合Domain类型
const defaultSoldDomainsData: Domain[] = defaultSoldDomainsDataRaw.map(item => ({
  ...item,
  status: "sold" as const
} as Domain));

// 创建上下文，提供默认值避免null检查
const DomainContext = createContext<DomainContextType>({
  domains: defaultDomainsData,
  soldDomains: defaultSoldDomainsData,
  friendlyLinks: defaultFriendlyLinksData,
  updateDomains: () => {},
  updateSoldDomains: () => {},
  updateFriendlyLinks: () => {},
  resetToDefaults: () => {},
  isLoading: false,
  saveToServer: async () => false,
})

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
  // 状态管理
  const [isLoading, setIsLoading] = useState(true)
  const [domains, setDomains] = useState<Domain[]>(defaultDomainsData)
  const [soldDomains, setSoldDomains] = useState<Domain[]>(defaultSoldDomainsData)
  const [friendlyLinks, setFriendlyLinks] = useState<FriendlyLink[]>(defaultFriendlyLinksData)

  // 初始化时从服务器和本地存储加载数据
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // 首先从localStorage获取数据
        const localDomains = getFromStorage<Domain[]>(DOMAINS_STORAGE_KEY, [])
        const localSoldDomains = getFromStorage<Domain[]>(SOLD_DOMAINS_STORAGE_KEY, [])
        const localFriendlyLinks = getFromStorage<FriendlyLink[]>(FRIENDLY_LINKS_STORAGE_KEY, [])
        
        // 如果有本地数据，立即设置
        if (localDomains.length > 0) setDomains(localDomains)
        if (localSoldDomains.length > 0) setSoldDomains(localSoldDomains)
        if (localFriendlyLinks.length > 0) setFriendlyLinks(localFriendlyLinks)
        
        // 然后尝试从服务器获取最新数据
        const serverDomains = await fetchData<any[]>(DOMAINS_FILENAME, defaultDomainsData)
          .then(data => data.map(item => ({
            ...item,
            status: (item.status as string).toLowerCase() === "available" ? "available" :
                   (item.status as string).toLowerCase() === "sold" ? "sold" : "active"
          } as Domain)));

        const serverSoldDomains = await fetchData<any[]>(SOLD_DOMAINS_FILENAME, defaultSoldDomainsData)
          .then(data => data.map(item => ({
            ...item,
            status: "sold" as const
          } as Domain)));

        const serverFriendlyLinks = await fetchData<FriendlyLink[]>(
          FRIENDLY_LINKS_FILENAME, 
          defaultFriendlyLinksData
        );
        
        // 更新状态并保存到本地
        setDomains(serverDomains)
        setSoldDomains(serverSoldDomains)
        setFriendlyLinks(serverFriendlyLinks)
        
        saveToStorage(DOMAINS_STORAGE_KEY, serverDomains)
        saveToStorage(SOLD_DOMAINS_STORAGE_KEY, serverSoldDomains)
        saveToStorage(FRIENDLY_LINKS_STORAGE_KEY, serverFriendlyLinks)
      } catch (error) {
        console.error("加载数据失败:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // 更新域名
  const updateDomains = (newDomains: Domain[]) => {
    setDomains(newDomains)
    saveToStorage(DOMAINS_STORAGE_KEY, newDomains)
  }

  // 更新已售域名
  const updateSoldDomains = (newSoldDomains: Domain[]) => {
    setSoldDomains(newSoldDomains)
    saveToStorage(SOLD_DOMAINS_STORAGE_KEY, newSoldDomains)
  }

  // 更新友情链接
  const updateFriendlyLinks = (newFriendlyLinks: FriendlyLink[]) => {
    setFriendlyLinks(newFriendlyLinks)
    saveToStorage(FRIENDLY_LINKS_STORAGE_KEY, newFriendlyLinks)
  }

  // 将数据保存到服务器
  const saveToServer = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      // 并行保存三种数据
      const results = await Promise.all([
        saveData(DOMAINS_FILENAME, domains),
        saveData(SOLD_DOMAINS_FILENAME, soldDomains),
        saveData(FRIENDLY_LINKS_FILENAME, friendlyLinks)
      ])
      
      // 如果有任何一个保存失败，返回失败
      return results.every(result => result === true)
    } catch (error) {
      console.error("保存数据到服务器失败:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 重置到默认值
  const resetToDefaults = () => {
    setDomains(defaultDomainsData)
    setSoldDomains(defaultSoldDomainsData)
    setFriendlyLinks(defaultFriendlyLinksData)
    
    saveToStorage(DOMAINS_STORAGE_KEY, defaultDomainsData)
    saveToStorage(SOLD_DOMAINS_STORAGE_KEY, defaultSoldDomainsData)
    saveToStorage(FRIENDLY_LINKS_STORAGE_KEY, defaultFriendlyLinksData)

    // 同时保存到服务器
    saveData(DOMAINS_FILENAME, defaultDomainsData)
    saveData(SOLD_DOMAINS_FILENAME, defaultSoldDomainsData)
    saveData(FRIENDLY_LINKS_FILENAME, defaultFriendlyLinksData)
  }

  // 提供上下文值
  const contextValue = {
    domains,
    soldDomains,
    friendlyLinks,
    updateDomains,
    updateSoldDomains,
    updateFriendlyLinks,
    resetToDefaults,
    isLoading,
    saveToServer
  }

  return <DomainContext.Provider value={contextValue}>{children}</DomainContext.Provider>
}

export function useDomainContext() {
  return useContext(DomainContext)
}

// 添加一个useDomains别名，保持兼容性
export function useDomains() {
  return useContext(DomainContext)
}

