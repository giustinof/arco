import { supabase } from './supabaseClient';

export async function getMonthlyReviewReminders() {
  const { data, error } = await supabase.rpc('get_monthly_review_reminders');
  if (error) throw error;
  return data;
}

export async function getWorkshopMessages() {
  const { data, error } = await supabase
    .from('Workshops')
    .select('id,emailMessage,SMSMessage,WhatsAppMessage');
  if (error) throw error;
  return data.reduce((acc, w) => {
    acc[w.id] = {
      emailMessage: w.emailMessage,
      SMSMessage: w.SMSMessage,
      WhatsAppMessage: w.WhatsAppMessage,
    };
    return acc;
  }, {});
}

export async function logNotification({ customer_id, vehicle_id, method, message, status, external_id = null }) {
  const { error } = await supabase
    .from('Notifications')
    .insert([{ customer_id, vehicle_id, method, message, status, external_id }]);
  if (error) console.error('Log notification error:', error.message);
}
