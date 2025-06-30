"use client"

import { useCallback } from 'react'

interface SmoothScrollLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function SmoothScrollLink({ href, children, className, onClick }: SmoothScrollLinkProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's a hash link, prevent default and smooth scroll
    if (href.startsWith('#')) {
      e.preventDefault()
      
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement) {
        // Get the header height for offset (sticky header)
        const header = document.querySelector('nav')
        const offset = header ? header.offsetHeight + 32 : 100 // Extra padding for better visibility
        
        // Calculate scroll position with offset
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = Math.max(0, elementPosition - offset) // Ensure we don't scroll above the page
        
        // Smooth scroll to target
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
        
        // Update URL hash without triggering navigation
        window.history.pushState(null, '', href)
        
        // Add a class to indicate active scroll target (optional for styling)
        document.querySelectorAll('[data-scroll-target]').forEach(el => el.removeAttribute('data-scroll-target'))
        targetElement.setAttribute('data-scroll-target', 'true')
      }
    }
    
    // Call any additional onClick handler
    if (onClick) {
      onClick()
    }
  }, [href, onClick])

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}