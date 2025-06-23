import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (user && !error) {
      // Get user metadata from Google
      const { user_metadata } = user

      // Update or create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
} 