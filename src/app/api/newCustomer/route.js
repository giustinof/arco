import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  const { workshopId, fullName, email, phoneNumber, isReachableThroughWhatsApp, plateNumbers } = await req.json();

  try {
    // Prima recupera il workshopId dalla tabella Workshops
    const { data: workshopData, error: workshopError } = await supabase
      .from('Workshops')
      .select('id')
      .eq('email', email) // assumendo che l'email del workshop sia uguale all'email dell'utente
      .single();

    if (workshopError) {
      console.error('Error fetching workshop:', workshopError);
      throw workshopError;
    }

    // Poi esegui l'insert nella tabella Customers
    const { data, error } = await supabase
      .from('Customers')
      .insert([
        {
          fullName,
          email,
          phoneNumber,
          isReachableThroughWhatsApp,
          PlateNumbers: plateNumbers,
          workshopId: workshopData.id, // usa l'id ottenuto dalla query precedente
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error inserting customer:', error);
      throw error;
    }

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Cliente creato con successo!' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Errore nella creazione del cliente' }), { status: 500 });
  }
}
