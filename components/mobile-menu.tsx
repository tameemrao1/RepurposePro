"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SmoothScrollLink } from "@/components/smooth-scroll-link"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false)

  // Handle escape key press
  useEffect(() => {
    setMounted(true)

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-sm bg-[#0f0f0f] z-[100] shadow-2xl",
          "transform transition-all duration-300 ease-in-out",
          "md:hidden", // Only show on mobile
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          width: '100vw', // Full width on mobile
          maxWidth: '100vw', // Ensure no horizontal overflow
          minHeight: '100vh', // Full height on mobile
          height: '100dvh' // Using dynamic viewport height for better mobile support
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-white/10">
            {/* Logo with animation */}
            <Link href="/" className="flex items-center gap-2 opacity-0 animate-fade-in" onClick={onClose}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] 
                          flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="font-semibold tracking-tight text-white/90 hover:text-white transition-colors">
                Repurpose Pro
              </span>
            </Link>

            {/* Close button with animation */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 
                       transition-all duration-200 hover:rotate-90"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close menu</span>
        </Button>
        </div>

        {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="h-full flex flex-col justify-center px-8">
              <ul className="space-y-8 w-full py-12">
            {[
              { name: "Features", href: "#features" },
              { name: "How It Works", href: "#how-it-works" },
              { name: "Testimonials", href: "#testimonials" },
              { name: "Pricing", href: "#pricing" },
              { name: "FAQ", href: "#faq" },
            ].map((item, index) => (
                  <li
                    key={item.name}
                    className="opacity-0"
                    style={{
                      animation: `fade-in-up 0.5s ease-out forwards ${index * 0.1}s`,
                    }}
                  >
                <SmoothScrollLink
                  href={item.href}
                  className="group flex items-center text-2xl font-light text-white/90 hover:text-white transition-all duration-200"
                  onClick={onClose}
                >
                  <span className="relative">
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                  </span>
                </SmoothScrollLink>
              </li>
            ))}
          </ul>

              <div className="space-y-6 w-full mb-8">
            <Link
              href="/login"
                  className="block text-center py-3 text-white/90 hover:text-white transition-colors text-xl
                           opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
              onClick={onClose}
            >
              Sign In
            </Link>
                <Link 
                  href="/signup" 
                  onClick={onClose}
                  className="opacity-0 block"
                  style={{ animation: "fade-in-up 0.5s ease-out forwards 0.6s" }}
                >
                  <Button className="w-full bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] hover:opacity-90 
                                   transition-all duration-300 py-6 text-xl font-medium rounded-xl
                                   shadow-[0_0_15px_rgba(124,59,237,0.3)] 
                                   hover:shadow-[0_0_25px_rgba(124,59,237,0.5)]
                                   transform hover:scale-[1.02]">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
          </div>

          {/* Social Links */}
          <div className="p-8 border-t border-white/10">
            <div className="flex justify-center space-x-8">
              {[
                {
                  icon: (props: any) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
                      {...props}
            >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
                  ),
                  href: "#twitter",
                },
                {
                  icon: (props: any) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
                      {...props}
            >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
                  ),
                  href: "#instagram",
                },
                {
                  icon: (props: any) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
                      {...props}
            >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
            </svg>
                  ),
                  href: "#linkedin",
                },
              ].map((social, index) => (
                <a
                  key={social.href}
                  href={social.href}
                  className="text-white/50 hover:text-white transition-all duration-200 transform hover:scale-110
                           opacity-0"
                  style={{ animation: `fade-in-up 0.5s ease-out forwards ${0.7 + index * 0.1}s` }}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
