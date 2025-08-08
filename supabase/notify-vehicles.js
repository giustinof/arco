import { serve } from 'std/server';
import { supabase } from "../src/lib/supabaseClient.js";

async function sendNotification(method, to, message) {
  console.log(`[${method.toUpperCase()}] a ${to}: ${message}`);
}

function replacePlaceholders(template, { customerName, workshopName, plate, date, workshopPhone }) {
  return template
    .replace('{customer.name}', customerName)
    .replace('{workshop.name}', workshopName)
    .replace('{vehicle.plateNumber}', plate)
    .replace('{date}', date)
    .replace('{workshop.phoneNumber}', workshopPhone);
}

serve(async () => {
  const now = new Date();

  const nextMonth = now.getMonth() + 2;
  const year = now.getFullYear() + (nextMonth > 12 ? 1 : 0);
  const month = ((nextMonth - 1) % 12) + 1;

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const { data: vehicles, error } = await supabase
    .from('Vehicles')
    .select('id, "plateNumber", "ownerId", "reviewDueDate", "workshopId"')
    .is('nextAppointmentId', null)
    .gte('reviewDueDate', startDate)
    .lt('reviewDueDate', endDate);

  if (error) {
    console.error(error);
    return new Response('Errore fetch veicoli', { status: 500 });
  }

  for (const vehicle of vehicles) {
    const [{ data: customer }, { data: workshop }] = await Promise.all([
      supabase.from('Customers').select('"fullName", email, "phoneNumber", "contactMethod"').eq('id', vehicle.ownerId).single(),
      supabase.from('Workshops').select('name, "phoneNumber", "messageTemplate"').eq('id', vehicle.workshopId).single()
    ]);

    const dueDateFormatted = `${String(month).padStart(2, '0')}/${year}`;

    const message = replacePlaceholders(workshop.messageTemplate, {
      customerName: customer.fullName,
      workshopName: workshop.name,
      plate: vehicle.plateNumber,
      date: dueDateFormatted,
      workshopPhone: workshop.phoneNumber
    });

    let recipient;
    switch (customer.contactMethod) {
      case 'email':
        recipient = customer.email;
        break;
      case 'sms':
      case 'whatsapp':
        recipient = customer.phoneNumber;
        break;
      default:
        console.log(`Metodo ${customer.contactMethod} non supportato`);
        continue;
    }

    await sendNotification(customer.contactMethod, recipient, message);
  }

  return new Response('Notifiche inviate.', { status: 200 });
});