import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSms(to, body) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error };
  }
}

export async function sendWhatsApp(to, body) {
  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
    return { success: false, error };
  }
}
