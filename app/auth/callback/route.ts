import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const email = searchParams.get('email')
  const type = searchParams.get('type')

  // Handle email verification
  if (type === 'email' || (email && !code)) {
    const token = searchParams.get('token')
    if (email && token) {
      return NextResponse.redirect(
        new URL(`/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, request.url)
      )
    }
  }

  // Handle OAuth/Magic Link callback
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
