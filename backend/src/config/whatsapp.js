// ============================================================
//  TurnoSalud — Config WhatsApp (Twilio)
//  Variables de entorno requeridas:
//    TWILIO_ACCOUNT_SID  → Panel de Twilio: Account SID
//    TWILIO_AUTH_TOKEN   → Panel de Twilio: Auth Token
//    TWILIO_WHATSAPP_FROM → Número emisor
//      - Sandbox:    whatsapp:+14155238886
//      - Producción: whatsapp:+54XXXXXXXXX (número aprobado)
// ============================================================
const twilio = require('twilio');

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

let cliente = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  cliente = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else {
  console.warn(
    '⚠️  [WhatsApp] Twilio no configurado — mensajes WhatsApp deshabilitados.\n' +
    '   Definí TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env para activarlo.'
  );
}

module.exports = { cliente };
