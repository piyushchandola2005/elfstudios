import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/book'

  if (code) {
    const supabase = createClient()
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if the user has a phone number set in their metadata
      const user = sessionData.session?.user;
      if (user && !user.user_metadata?.phone) {
        return NextResponse.redirect(`${origin}/complete-profile`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=AuthError`)
}
