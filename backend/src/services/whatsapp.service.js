// ============================================================
//  TurnoSalud — Servicio WhatsApp (Twilio)
// ============================================================
const { cliente } = require('../config/whatsapp');

/**
 * Normaliza un número de teléfono al formato E.164.
 * Asume Argentina (+54) si no hay código de país.
 *
 * Ejemplos de entrada:
 *   "1145678900"   → "+541145678900"
 *   "01145678900"  → "+541145678900"  (quita el 0 local)
 *   "+5491145678900" → "+5491145678900" (ya OK)
 */
const normalizarTelefono = (telefono) => {
  if (!telefono) return null;
  // Quitar espacios, guiones, puntos, paréntesis
  const limpio = telefono.replace(/[\s\-().+]/g, '');
  if (!limpio) return null;

  if (telefono.startsWith('+')) {
    return telefono.replace(/[\s\-().]/g, '');
  }
  // Número con 0 inicial argentino (0xx xxxx-xxxx)
  if (limpio.startsWith('0')) {
    return `+54${limpio.slice(1)}`;
  }
  // Ya sin 0, sin +  (puede ser 9 11 XXXX-XXXX)
  return `+54${limpio}`;
};

/**
 * Envía un mensaje de WhatsApp usando Twilio.
 * Si Twilio no está configurado, loggea un warning y retorna sin error.
 *
 * @param {string} to      - Número de teléfono del destinatario (del paciente en DB)
 * @param {string} mensaje - Texto plano del mensaje
 */
const enviarWhatsApp = async (to, mensaje) => {
  if (!cliente) {
    console.warn('[WhatsApp] Twilio no configurado — mensaje no enviado a:', to);
    return;
  }

  const toFormateado = normalizarTelefono(to);
  if (!toFormateado) {
    console.warn('[WhatsApp] Número inválido, se omite el envío:', to);
    return;
  }

  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  await cliente.messages.create({
    from,
    to: `whatsapp:${toFormateado}`,
    body: mensaje,
  });

  console.log(`[WhatsApp] ✅ Mensaje enviado a ${toFormateado}`);
};

module.exports = { enviarWhatsApp };
