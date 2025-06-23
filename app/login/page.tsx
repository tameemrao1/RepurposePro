"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { useLoading } from "@/components/loading-provider"
import { Toaster } from "@/components/ui/toaster"
import { LandingHeader } from "@/components/landing-header"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { setIsLoading: setGlobalLoading, setLoadingMessage } = useLoading()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      setGlobalLoading(true)
      setLoadingMessage("Signing in...")
      setError('') // Clear any previous errors
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in.')
        } else {
          throw error
        }
      }

      // Redirect to the original requested URL or dashboard
      const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
      
      // Update loading message for redirection
      setLoadingMessage("Loading your dashboard...")
      
      router.push(redirectTo)
      
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
      setGlobalLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setGlobalLoading(true)
      setLoadingMessage("Connecting to Google...")
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google",
      })
      setGlobalLoading(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0014] text-white">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#7c3bed]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] bg-[#a56eff]/20 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-[#7c3bed]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="container max-w-screen-xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center space-y-8">
            <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
              <form onSubmit={handleSubmit}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-medium">Welcome back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                  {error && (
                    <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                      placeholder="m@example.com"
                        type="email"
                      required
                      disabled={isLoading}
                      className="bg-white/5"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      <Link
                        href="/reset-password"
                        className="text-sm text-primary hover:underline"
                      >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                      required
                      disabled={isLoading}
                      className="bg-white/5"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    className="w-full"
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                      </svg>
                    Sign in with Google
                    </Button>
                </CardFooter>
              </form>
            </Card>

            <p className="text-center text-sm text-white/70">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
