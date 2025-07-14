import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio WhatsApp configurado com sucesso');
} else {
  console.log('⚠️  Twilio WhatsApp não configurado - variáveis de ambiente ausentes');
}

interface WhatsAppNotification {
  to: string;
  clientName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'confirmed' | 'cancelled';
}

export async function sendAppointmentNotification(notification: WhatsAppNotification): Promise<boolean> {
  if (!client) {
    console.log('⚠️  Twilio não configurado - notificação WhatsApp não enviada');
    return false;
  }

  try {
    const toNumber = `whatsapp:${notification.to}`;
    let message: string;
    
    if (notification.status === 'confirmed') {
      message = `🎉 *Agendamento Confirmado!*

Olá ${notification.clientName}! 

Seu agendamento foi confirmado com sucesso:

📅 *Serviço:* ${notification.serviceName}
📅 *Data:* ${notification.appointmentDate}
⏰ *Horário:* ${notification.appointmentTime}

Aguardamos você no nosso salão! 💅✨

_Para qualquer dúvida, entre em contato conosco._`;
    } else {
      message = `❌ *Agendamento Cancelado*

Olá ${notification.clientName},

Infelizmente seu agendamento foi cancelado:

📅 *Serviço:* ${notification.serviceName}
📅 *Data:* ${notification.appointmentDate}
⏰ *Horário:* ${notification.appointmentTime}

Entre em contato para reagendar! 📞

_Sentimos muito pelo inconveniente._`;
    }

    const result = await client.messages.create({
      from: whatsappNumber,
      to: toNumber,
      body: message
    });

    console.log(`✅ WhatsApp enviado para ${notification.clientName}: ${result.sid}`);
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao enviar WhatsApp:', error.message);
    if (error.code) console.error(`Código do erro: ${error.code}`);
    if (error.moreInfo) console.error(`Mais informações: ${error.moreInfo}`);
    return false;
  }
}

export async function testWhatsAppConnection(): Promise<{ success: boolean; message: string }> {
  if (!client) {
    return {
      success: false,
      message: 'Twilio não configurado. Adicione TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN nas variáveis de ambiente.'
    };
  }

  try {
    const account = await client.api.accounts(accountSid).fetch();
    return {
      success: true,
      message: `Conexão Twilio OK. Conta: ${account.friendlyName}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro na conexão Twilio: ${error.message}`
    };
  }
}

export { client as twilioClient };