"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, X, User, LogOut, Settings, History, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/components/ui/use-toast"
import { useLoading } from "@/components/loading-provider"

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { state: sidebarState } = useSidebar()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const { setIsLoading: setGlobalLoading, setLoadingMessage } = useLoading()
  const { isMobile } = useSidebar()
  const [userData, setUserData] = useState<{ first_name?: string; email?: string }>({})

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, email')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUserData(profile)
        } else {
          // If no profile exists, use email
          setUserData({ email: session.user.email })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [supabase])

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      const loadedNotifications = await getNotifications()
      setNotifications(loadedNotifications)
    }

    loadNotifications()

    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Focus search input when search is opened
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Calculate unread notifications count
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const handleNotificationClick = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      // Update the UI to show this notification as read
      setNotifications(prev => prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      // Update the UI to show all notifications as read
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true
      })))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification(id)
    const updatedNotifications = notifications.filter((notification) => notification.id !== id)
    setNotifications(updatedNotifications)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Store the search query in localStorage for persistence
      localStorage.setItem("lastSearchQuery", searchQuery)

      // Navigate to history page with search parameter
      router.push(`/history?search=${encodeURIComponent(searchQuery)}`)

      // Close search on mobile after submitting
      if (isSearchOpen) {
        setIsSearchOpen(false)
      }
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return "just now"
    
    try {
      const now = new Date()
      const date = new Date(timestamp)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return "just now"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "recently"
    }
  }

  const handleLogout = async () => {
    try {
      setGlobalLoading(true)
      setLoadingMessage("Signing out...")
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "See you soon!",
        description: "You have been logged out successfully.",
      })

      // Update loading message for redirection
      setLoadingMessage("Redirecting to login...")
      
      // Add a small delay before redirecting to allow toast to show
      setTimeout(() => {
        router.push('/login')
      }, 500)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      })
      setGlobalLoading(false)
    }
  }

  // Get the display letter for the avatar
  const getDisplayLetter = () => {
    if (userData.first_name) {
      return userData.first_name[0].toUpperCase()
    }
    if (userData.email) {
      return userData.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="block mx-3 md:hidden rounded-lg bg-primary p-1.5 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-zap h-5 w-5 text-primary-foreground"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg></div>
        {title && (
          <div className="ml-2 hidden md:block">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center space-x-4">
            <ModeToggle />

            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mb-4">
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  {notifications.length > 0 ? (
                    <div className="space-y-4 pr-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`relative rounded-lg border p-4 transition-colors ${
                            notification.read ? "bg-background" : "bg-muted/50"
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 -mr-2 -mt-2"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {!notification.read && <Badge variant="outline">New</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No notifications</div>
                  )}
                </ScrollArea>
                <SheetFooter className="mt-4 flex-row justify-between">
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </Button>
                  <SheetClose asChild>
                    <Button size="sm">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getDisplayLetter()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Mobile-only navigation items */}
                <div className="md:hidden">
                  <DropdownMenuItem onClick={() => handleNavigate("/")} className="gap-2">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("/generator")} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Generator</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate("/history")} className="gap-2">
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                </div>

                <DropdownMenuItem onClick={() => handleNavigate("/settings")} className="gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate("/settings")} className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate("/settings?tab=api")} className="gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>API</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
