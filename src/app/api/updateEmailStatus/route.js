import { supabase } from '../../../lib/supabaseClient'

export async function POST(req) {
  const { email } = await req.json()

  const { data: workshop, error } = await supabase
    .from('Workshops')
    .update({ isEmailVerified: true })
    .eq('email', email)

  if (error) {
    return new Response('Errore aggiornamento email', { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
