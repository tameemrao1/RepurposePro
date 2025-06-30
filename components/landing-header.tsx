import Link from "next/link"
import { Button } from "@/components/ui/button"
import MobileMenuWrapper from "@/components/mobile-menu-wrapper"
import { SmoothScrollLink } from "@/components/smooth-scroll-link"

export function LandingHeader() {
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-semibold tracking-tight text-white">Repurpose Pro</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <SmoothScrollLink href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
            Features
          </SmoothScrollLink>
          <SmoothScrollLink href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
            How It Works
          </SmoothScrollLink>
          <SmoothScrollLink href="#testimonials" className="text-sm text-white/70 hover:text-white transition-colors">
            Testimonials
          </SmoothScrollLink>
          <SmoothScrollLink href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
            Pricing
          </SmoothScrollLink>
          <SmoothScrollLink href="#faq" className="text-sm text-white/70 hover:text-white transition-colors">
            FAQ
          </SmoothScrollLink>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden rounded-sm md:block text-sm text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <MobileMenuWrapper />
        </div>
      </div>
    </nav>
  )
} 