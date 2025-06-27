import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(requestUrl.origin + '/login?error=auth_error')
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) {
        console.error('Auth exchange error:', authError)
        return NextResponse.redirect(requestUrl.origin + '/login?error=auth_exchange_failed')
      }

      if (user) {
        // Get user metadata from Google
        const { user_metadata } = user

        // Update or create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: user_metadata?.full_name?.split(' ')[0] || user_metadata?.name?.split(' ')[0] || '',
            last_name: user_metadata?.full_name?.split(' ').slice(1).join(' ') || user_metadata?.name?.split(' ').slice(1).join(' ') || '',
            email: user.email
          })

        if (profileError) {
          console.error('Error updating profile:', profileError)
          // Don't fail the login if profile update fails
        }

        // Get the original redirect destination from query params or default to dashboard
        const redirectTo = requestUrl.searchParams.get('redirectedFrom') || '/dashboard'
        
        // Clear loading state and redirect
        const response = NextResponse.redirect(requestUrl.origin + redirectTo)
        
        // Add headers to ensure proper session handling
        response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
        
        return response
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(requestUrl.origin + '/login?error=callback_error')
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(requestUrl.origin + '/login?error=no_code')
} 