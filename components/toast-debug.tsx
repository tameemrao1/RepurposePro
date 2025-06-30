"use client"

import { useSimpleNotifications } from "@/hooks/use-simple-notifications"
import { Button } from "@/components/ui/button"

export function ToastDebug() {
  const { showToast } = useSimpleNotifications()

  const testToasts = () => {
    showToast("Test Success", "This is a success notification that should be visible on mobile devices", "success", 8000)
    
    setTimeout(() => {
      showToast("Test Info", "This is an info notification for mobile testing", "info", 8000)
    }, 1000)
    
    setTimeout(() => {
      showToast("Test Warning", "This is a warning notification on mobile", "warning", 8000)
    }, 2000)
    
    setTimeout(() => {
      showToast("Test Error", "This is an error notification for mobile", "error", 8000)
    }, 3000)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[10000]">
      <Button 
        onClick={testToasts}
        size="sm"
        variant="outline"
        className="bg-background/80 backdrop-blur-sm"
      >
        Test Toasts
      </Button>
    </div>
  )
}