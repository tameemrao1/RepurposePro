import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from "@/components/loading-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ClientLayout } from "@/components/client-layout"
import { MobileNotifications } from "@/components/mobile-notifications"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Repurpose Pro",
  description: "AI-powered content repurposing tool",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full w-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LoadingProvider>
            <SidebarProvider defaultOpen={true}>
              <ClientLayout>
                {children}
              </ClientLayout>
              <MobileNotifications />
              <Toaster />
            </SidebarProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
