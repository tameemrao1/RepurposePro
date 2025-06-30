"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, History, Home, Settings, Sparkles, Zap, HelpCircle, ChevronRight, Menu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { getUsageStats } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar()
  const [stats, setStats] = useState({
    blogsProcessed: 0,
    contentGenerated: 0,
    platformsUsed: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const usageStats = await getUsageStats()
    setStats({
      blogsProcessed: usageStats.blogsProcessed,
      contentGenerated: usageStats.contentGenerated,
      platformsUsed: usageStats.platformsUsed || [],
    })
      } catch (error) {
        console.error('Failed to fetch usage stats:', error)
      }
    }

    fetchStats()

    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      description: "Overview and analytics"
    },
    {
      title: "Generator",
      icon: Sparkles,
      href: "/generator",
      description: "Create new content"
    },
    {
      title: "Library",
      icon: History,
      href: "/library",
      description: "View saved content"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      description: "Manage preferences"
    },
  ]

  // Calculate usage percentage (for demo purposes)
  const usagePercentage = Math.min(Math.round((stats.contentGenerated / (stats.contentGenerated + 20)) * 100), 100)

  return (
    <>
      {/* Mobile Menu Button */}
      {/* {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-50 md:hidden"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      )} */}

    <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="flex h-[60px] items-center border-b px-4 flex-shrink-0">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 transition-all duration-200 hover:opacity-80"
            onClick={() => {
              if (isMobile) {
                setOpenMobile(false)
              }
            }}
          >
            <div className="rounded-lg bg-primary p-1.5 shadow-sm">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
            <span className={cn(
              "font-semibold tracking-tight transition-all duration-200",
              state === "collapsed" ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
            )}>
            Repurpose Pro
          </span>
        </Link>
      </SidebarHeader>

        <SidebarContent className="px-2 py-2 flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                        className={cn(
                          "group relative flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Link 
                          href={item.href} 
                          className="flex w-full items-center gap-3"
                          onClick={() => {
                            if (isMobile) {
                              setOpenMobile(false)
                            }
                          }}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            pathname === item.href
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          <div className={cn(
                            "flex flex-col gap-0.5 transition-all duration-200",
                            state === "collapsed" ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
                          )}>
                            <span className="line-clamp-1">{item.title}</span>
                            <span className="line-clamp-1 text-xs font-normal text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                          {pathname === item.href && (
                            <ChevronRight className={cn(
                              "ml-auto h-4 w-4 text-primary transition-transform",
                              state === "collapsed" ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                            )} />
                          )}
                </Link>
              </SidebarMenuButton>
                    </TooltipTrigger>
                    {state === "collapsed" && (
                      <TooltipContent side="right" className="flex flex-col gap-0.5">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

        <SidebarFooter className="mt-auto border-t p-4 flex-shrink-0">
          <div className={cn(
            "rounded-lg bg-muted/50 p-4 transition-all duration-200",
            state === "collapsed" ? "px-2 py-3" : ""
          )}>
          {state !== "collapsed" && (
              <div className="mb-3 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Usage Stats</span>
            </div>
          )}

          {isLoading ? (
            <div className={cn("space-y-2", state === "collapsed" ? "hidden" : "")}>
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          ) : (
            <>
              {state === "collapsed" ? (
                <div className="flex flex-col items-center">
                    <BarChart2 className="mb-2 h-5 w-5 text-primary" />
                    <Progress value={usagePercentage} className="h-1 w-full bg-muted" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Blogs processed</span>
                      <span className="font-medium tabular-nums">{stats.blogsProcessed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Content generated</span>
                      <span className="font-medium tabular-nums">{stats.contentGenerated}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platforms used</span>
                      <span className="font-medium tabular-nums">{stats.platformsUsed.length}</span>
                  </div>
                  <div className="pt-1">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-medium tabular-nums">{usagePercentage}%</span>
                      </div>
                      <Progress
                        value={usagePercentage}
                        className="h-1.5 bg-muted"
                      />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {state !== "collapsed" && (
          <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 font-medium text-muted-foreground hover:text-foreground"
              >
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
    </>
  )
}
