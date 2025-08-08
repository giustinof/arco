import { getMonthlyReviewReminders, getWorkshopMessages, logNotification } from '../../lib/notifications';
import { sendEmail } from '../../utils/sendEmail';
import { sendSms, sendWhatsApp } from '../../utils/sendSms';

function formatMessage(template, customer, workshop, vehicle, date) {
  return template
    .replace('{customer.name}', customer.fullName)
    .replace('{workshop.name}', workshop.workshop_name)
    .replace('{workshop.phoneNumber}', workshop.workshop_phone)
    .replace('{vehicle.plateNumber}', vehicle.plateNumber)
    .replace('{date}', date);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-cron-secret'];
  if (!secret || secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const customers = await getMonthlyReviewReminders();
    const workshopMessages = await getWorkshopMessages();

    if (!customers.length) return res.status(200).json({ message: 'No reminders to send this month' });

    const results = [];

    for (const customer of customers) {
      const { id, fullName, email, phoneNumber, contactMethod, workshop_id, workshop_name, workshop_phone, vehicles } = customer;

      for (const vehicle of vehicles) {
        const date = vehicle.reviewDueDate;
        const workshopMsg = workshopMessages[workshop_id] || {};
        const emailTemplate = workshopMsg.emailMessage || "Ciao {customer.name}, la revisione del veicolo {vehicle.plateNumber} scade il {date}.";
        const smsTemplate = workshopMsg.SMSMessage || emailTemplate;
        const whatsappTemplate = workshopMsg.WhatsAppMessage || emailTemplate;

        const message = formatMessage(
          contactMethod === 'email' ? emailTemplate :
          contactMethod === 'sms' ? smsTemplate :
          whatsappTemplate,
          customer,
          { workshop_name, workshop_phone },
          vehicle,
          date
        );

        let sendResult;

        if (contactMethod === 'email' && email) {
          sendResult = await sendEmail(email, 'Promemoria revisione auto', message);
          await logNotification({
            customer_id: id,
            vehicle_id: vehicle.vehicleId,
            method: 'email',
            message,
            status: sendResult.success ? 'sent' : 'failed',
            external_id: sendResult.sid || null,
          });
        } else if ((contactMethod === 'sms' || contactMethod === 'whatsapp') && phoneNumber) {
          if (contactMethod === 'sms') {
            sendResult = await sendSms(phoneNumber, message);
          } else {
            sendResult = await sendWhatsApp(phoneNumber, message);
          }
          await logNotification({
            customer_id: id,
            vehicle_id: vehicle.vehicleId,
            method: contactMethod,
            message,
            status: sendResult.success ? 'sent' : 'failed',
            external_id: sendResult.sid || null,
          });
        } else {
          await logNotification({
            customer_id: id,
            vehicle_id: vehicle.vehicleId,
            method: 'none',
            message: 'Nessun metodo di contatto valido per invio reminder',
            status: 'failed',
          });
          sendResult = { success: false };
        }

        results.push({ customer: fullName, vehicle: vehicle.plateNumber, method: contactMethod, success: sendResult.success });
      }
    }

    res.status(200).json({ message: 'Reminder inviati', results });

  } catch (error) {
    console.error('Errore invio promemoria:', error);
    res.status(500).json({ error: 'Errore interno' });
  }
}
