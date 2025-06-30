"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getNotifications, markNotificationAsRead } from "@/lib/api"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

export function MobileNotifications() {
  const { toast } = useToast()
  const [lastNotificationTime, setLastNotificationTime] = useState<string | null>(null)
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set())
  
  const supabase = createClientComponentClient()

  // Function to show toast notification
  const showToastNotification = (notification: Notification) => {
    const toastVariant = notification.type === "error" ? "destructive" : 
                       notification.type === "success" ? "success" :
                       notification.type === "warning" ? "warning" : "info"

    toast({
      title: notification.title,
      description: notification.message,
      variant: toastVariant as any,
      duration: 6000, // 6 seconds for better mobile visibility
    })

    // Mark notification as read after showing toast
    setTimeout(() => {
      markNotificationAsRead(notification.id).catch(console.error)
    }, 1000)
  }

  // Check for new notifications
  const checkForNewNotifications = async () => {
    try {
      const notifications = await getNotifications()
      
      // Filter unread notifications that we haven't processed yet
      const newNotifications = notifications.filter((notification: Notification) => 
        !notification.read && 
        !processedNotifications.has(notification.id) &&
        (!lastNotificationTime || new Date(notification.created_at) > new Date(lastNotificationTime))
      )

      if (newNotifications.length > 0) {
        // Show toast notifications for new notifications
        newNotifications.forEach((notification: Notification) => {
          showToastNotification(notification)
          setProcessedNotifications(prev => new Set(prev).add(notification.id))
        })

        // Update last notification time
        const latestTime = Math.max(...newNotifications.map((n: Notification) => new Date(n.created_at).getTime()))
        setLastNotificationTime(new Date(latestTime).toISOString())
      }
    } catch (error) {
      console.error("Error checking notifications:", error)
    }
  }

  // Set up real-time subscription for notifications
  useEffect(() => {
    let mounted = true
    
    const setupNotificationSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || !mounted) return

      // Initialize with current notifications
      const notifications = await getNotifications()
      if (notifications.length > 0 && mounted) {
        const latestTime = Math.max(...notifications.map((n: Notification) => new Date(n.created_at).getTime()))
        setLastNotificationTime(new Date(latestTime).toISOString())
      }

      // Set up real-time subscription
      const channel = supabase
        .channel('notification_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            if (!mounted) return
            
            const newNotification = payload.new as Notification
            
            // Show toast for all new notifications
            showToastNotification(newNotification)
            setProcessedNotifications(prev => new Set(prev).add(newNotification.id))
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    const cleanup = setupNotificationSubscription()

    return () => {
      mounted = false
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [supabase, toast])

  // Periodic check for notifications (fallback)
  useEffect(() => {
    const interval = setInterval(checkForNewNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [lastNotificationTime, processedNotifications])

  return null // This component doesn't render anything visible
}