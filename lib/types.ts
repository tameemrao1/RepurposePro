import type { LucideIcon } from "lucide-react"

export interface Platform {
  id: string
  name: string
  icon: LucideIcon
  description?: string
  color?: string
}

export interface Tone {
  id: string
  name: string
  icon: LucideIcon
  description?: string
}

export interface GenerationRequest {
  content: string
  platforms: string[]
  tone: string
  outputCount: number
  language?: string
  onProgress?: () => void
}

export interface RegenerateRequest {
  content: string
  platform: string
  tone: string
  language?: string
}

export interface SuggestionRequest {
  content: string
  platform: string
  tone: string
  count?: number
}

export interface GeneratedItem {
  platform: string
  content: string
  hashtags?: string[]
  viralScore?: number // percentage from AI
  seoScore?: number // percentage from AI
}

export interface Suggestion {
  platform: string
  content: string
}

export interface ContentItem {
  id: string
  title: string
  content: string
  timestamp: string
  platforms: string[]
  hashtags?: string[]
  lastModified?: string
}

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}
