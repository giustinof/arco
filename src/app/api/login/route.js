import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatorie' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      const errorMessage = {
        'Invalid login credentials': 'Credenziali non valide',
        'Email not confirmed': 'Email non verificata'
      }[error.message] || 'Errore durante il login';

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
