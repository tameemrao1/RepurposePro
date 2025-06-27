import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name)?.value
          console.log(`Getting cookie ${name}:`, cookie ? 'exists' : 'missing')
          return cookie
        },
        set(name: string, value: string, options: any) {
          console.log(`Setting cookie ${name}`)
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          console.log(`Removing cookie ${name}`)
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug logging
  console.log('Middleware - Path:', req.nextUrl.pathname)
  console.log('Middleware - Session exists:', !!session)
  console.log('Middleware - User ID:', session?.user?.id)

  // If there's no session and the user is trying to access a protected route
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || 
                  req.nextUrl.pathname.startsWith('/generator') || 
                  req.nextUrl.pathname.startsWith('/library') || 
                  req.nextUrl.pathname.startsWith('/settings'))) {
    console.log('Middleware - Redirecting to login, no session found')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access auth pages
  if (session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: []  // Disable middleware temporarily
} 