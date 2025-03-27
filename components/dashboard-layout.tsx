import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, Database, Cog, GripVertical, PanelLeftClose, PanelLeft } from "lucide-react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useEffect, useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: "dashboard" | "domains" | "backup" | "settings"
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  // 侧边栏默认尺寸
  const defaultSidebarSize = 20
  const collapsedSize = 4
  
  // 保存和恢复侧边栏尺寸
  const [sidebarSize, setSidebarSize] = useState<number>(defaultSidebarSize)
  const [prevSidebarSize, setPrevSidebarSize] = useState<number>(defaultSidebarSize)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  
  // 从localStorage加载保存的侧边栏尺寸
  useEffect(() => {
    const savedSize = localStorage.getItem('dashboard-sidebar-size')
    const savedCollapsed = localStorage.getItem('dashboard-sidebar-collapsed')
    
    if (savedSize) {
      setSidebarSize(Number(savedSize))
      setPrevSidebarSize(Number(savedSize))
    }
    
    if (savedCollapsed === 'true') {
      setIsSidebarCollapsed(true)
      setSidebarSize(collapsedSize)
    }
  }, [])
  
  // 保存侧边栏调整尺寸
  const handleSidebarResize = (sizes: number[]) => {
    const newSize = sizes[0]
    setSidebarSize(newSize)
    
    // 只有在非折叠状态下才保存尺寸
    if (newSize > collapsedSize) {
      setPrevSidebarSize(newSize)
      localStorage.setItem('dashboard-sidebar-size', String(newSize))
      setIsSidebarCollapsed(false)
      localStorage.setItem('dashboard-sidebar-collapsed', 'false')
    }
  }
  
  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    if (isSidebarCollapsed) {
      // 展开到之前的尺寸
      setSidebarSize(prevSidebarSize)
      setIsSidebarCollapsed(false)
      localStorage.setItem('dashboard-sidebar-collapsed', 'false')
    } else {
      // 保存当前尺寸并折叠
      setPrevSidebarSize(sidebarSize)
      setSidebarSize(collapsedSize)
      setIsSidebarCollapsed(true)
      localStorage.setItem('dashboard-sidebar-collapsed', 'true')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* 使用ResizablePanelGroup替换原有的flex布局 */}
      <ResizablePanelGroup 
        direction="horizontal" 
        className="w-full h-full"
        onLayout={handleSidebarResize}
      >
        {/* 侧边栏导航 - 可调整宽度 */}
        <ResizablePanel 
          defaultSize={sidebarSize} 
          minSize={collapsedSize} 
          maxSize={30}
          className="hidden md:block"
          id="sidebar"
        >
          <div className="h-full flex flex-col border-r bg-gray-50/50 relative">
            <div className="p-4 flex justify-between items-center">
              <h2 className={cn("text-lg font-semibold", isSidebarCollapsed && "sr-only")}>管理控制台</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8 rounded-full"
                onClick={toggleSidebar}
              >
                {isSidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-2 overflow-hidden">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                isActive={activeTab === "dashboard"}
                collapsed={isSidebarCollapsed}
              >
                控制台首页
              </NavItem>
              <NavItem 
                href="/dashboard/domains" 
                icon={<Settings className="h-5 w-5" />} 
                isActive={activeTab === "domains"}
                collapsed={isSidebarCollapsed}
              >
                域名管理
              </NavItem>
              <NavItem 
                href="/dashboard/backup" 
                icon={<Database className="h-5 w-5" />} 
                isActive={activeTab === "backup"}
                collapsed={isSidebarCollapsed}
              >
                备份管理
              </NavItem>
              <NavItem 
                href="/dashboard/settings" 
                icon={<Cog className="h-5 w-5" />} 
                isActive={activeTab === "settings"}
                collapsed={isSidebarCollapsed}
              >
                网站设置
              </NavItem>
            </nav>
          </div>
        </ResizablePanel>

        {/* 可调整的分隔线手柄 */}
        <ResizableHandle withHandle className="hidden md:flex" />

        {/* 主内容区域 */}
        <ResizablePanel defaultSize={100 - sidebarSize}>
          {/* 移动端顶部导航 */}
          <div className="md:hidden border-b w-full">
            <div className="flex overflow-x-auto p-2 space-x-1">
              <MobileNavItem href="/dashboard" isActive={activeTab === "dashboard"}>
                首页
              </MobileNavItem>
              <MobileNavItem href="/dashboard/domains" isActive={activeTab === "domains"}>
                域名
              </MobileNavItem>
              <MobileNavItem href="/dashboard/backup" isActive={activeTab === "backup"}>
                备份
              </MobileNavItem>
              <MobileNavItem href="/dashboard/settings" isActive={activeTab === "settings"}>
                设置
              </MobileNavItem>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 overflow-auto h-full">
            <div className="container mx-auto px-4 py-8 max-w-6xl">{children}</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// 侧边栏导航项
function NavItem({
  href,
  icon,
  isActive,
  children,
  collapsed = false,
}: {
  href: string
  icon: React.ReactNode
  isActive: boolean
  children: React.ReactNode
  collapsed?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? String(children) : undefined}
    >
      {icon}
      {!collapsed && children}
    </Link>
  )
}

// 移动端导航项
function MobileNavItem({
  href,
  isActive,
  children,
}: {
  href: string
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <Button variant={isActive ? "default" : "ghost"} size="sm" asChild className="flex-shrink-0">
      <Link href={href}>{children}</Link>
    </Button>
  )
}

