// /app/api/logout/route.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: 'Logout effettuato.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
