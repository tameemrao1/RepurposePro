"use client"

import { useToast } from "@/hooks/use-toast"

export function useSimpleNotifications() {
  const { toast } = useToast()

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration: number = 6000 // Increased for mobile visibility
  ) => {
    const getIcon = (type: string) => {
      switch (type) {
        case "success":
          return "✅"
        case "error":
          return "❌"
        case "warning":
          return "⚠️"
        default:
          return "ℹ️"
      }
    }

    const variant = type === "error" ? "destructive" : type

    toast({
      title: `${getIcon(type)} ${title}`,
      description: message,
      variant: variant as any,
      duration,
    })
  }

  return { showToast }
}