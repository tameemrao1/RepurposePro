import {
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  MessageCircle,
  Mail,
  Lightbulb,
  Briefcase,
  Smile,
  GraduationCap,
  Zap,
  Laugh,
} from "lucide-react"
import type { Platform, Tone } from "./types"

export const platforms: Platform[] = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    description: "Short-form content with hashtags",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Visual content with captions",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    description: "Professional content for networking",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    description: "Engaging content for communities",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: Youtube,
    description: "Short video scripts",
  },
  {
    id: "threads",
    name: "Threads",
    icon: MessageCircle,
    description: "Conversational content",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Newsletter content",
  },
]

export const tones: Tone[] = [
  {
    id: "professional",
    name: "Professional",
    icon: Briefcase,
    description: "Formal and business-oriented",
  },
  {
    id: "friendly",
    name: "Friendly",
    icon: Smile,
    description: "Warm and approachable",
  },
  {
    id: "educational",
    name: "Educational",
    icon: GraduationCap,
    description: "Informative and instructional",
  },
  {
    id: "witty",
    name: "Witty",
    icon: Lightbulb,
    description: "Clever and humorous",
  },
  {
    id: "enthusiastic",
    name: "Enthusiastic",
    icon: Zap,
    description: "Energetic and exciting",
  },
  {
    id: "casual",
    name: "Casual",
    icon: Laugh,
    description: "Relaxed and conversational",
  },
]
