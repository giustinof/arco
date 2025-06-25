// /app/api/register/route.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function POST(req) {
  try {

    const body = await req.json();

    const { name, email, phoneNumber, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Le password non coincidono." }), { status: 400 });
    }

    // 1. Crea l'utente in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      console.error(signUpError);
      return new Response(JSON.stringify({ error: "Errore durante la registrazione: " + signUpError.message }), { status: 500 });
    }

    const userId = authData.user.id;

    // 2. Aggiungi l’utente alla tabella Workshops
    const { error: insertError } = await supabase
      .from('Workshops')
      .insert([
        {
          id: userId,
          name,
          email,
          phoneNumber,
          isEmailVerified: false,
          isPhoneNumberVerified: false,
        }
      ]);

    if (insertError) {
      console.error(insertError);
      return new Response(JSON.stringify({ error: "Errore durante il salvataggio dei dati dell'officina." }), { status: 500 });
    }

    // 3. Aggiungi l'utente alla tabella Workers
    const { error: workerError } = await supabase
    .from('Workers')
    .insert([
      {
        workerId: userId,
        workshopId: userId,
        role: 1,
      }
    ])

    if (workerError) {
      console.log(workerError)
      return new Response(JSON.stringify({ error: "Errore durante il salvataggio dei dati del lavoratore." }), { status:500 });
    }

    return new Response(JSON.stringify({ success: true, message: "Registrazione completata. Controlla l’email per confermare l’indirizzo." }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Errore imprevisto durante la registrazione." }), { status: 500 });
  }
}
