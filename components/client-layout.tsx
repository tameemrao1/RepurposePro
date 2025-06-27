"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  
  // Pages where sidebar should not be shown
  const noSidebarPages = ['/', '/login', '/signup', '/register']
  const showSidebar = !noSidebarPages.includes(pathname)

  if (!showSidebar) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden">
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
} 