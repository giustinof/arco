import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()

  // Crea il client Supabase passando req e res
  const supabase = createMiddlewareClient({ req, res })

  // Aggiorna la sessione, se presente
  await supabase.auth.getSession()

  return res
}

// Applica il middleware a tutte le rotte tranne i file statici
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
