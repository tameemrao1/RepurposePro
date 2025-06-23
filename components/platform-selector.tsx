"use client"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Platform } from "@/lib/types"

interface PlatformSelectorProps {
  platforms: Platform[]
  selectedPlatforms: string[]
  setSelectedPlatforms: (platforms: string[]) => void
}

export default function PlatformSelector({
  platforms,
  selectedPlatforms,
  setSelectedPlatforms,
}: PlatformSelectorProps) {
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter((id) => id !== platformId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-3">
      {platforms.map((platform) => (
        <motion.div
          key={platform.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative flex items-center justify-center p-3 sm:p-4 rounded-lg border cursor-pointer transition-all",
            selectedPlatforms.includes(platform.id)
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50",
          )}
          onClick={() => togglePlatform(platform.id)}
        >
          {selectedPlatforms.includes(platform.id) && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            <platform.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 text-foreground/80" />
            <span className="text-xs sm:text-sm font-medium">{platform.name}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
