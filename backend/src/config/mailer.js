const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465, // true para 465, false para otros puertos
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Wrapper para enviar correos
const sendMail = async ({ to, subject, html }) => {
  try {
    // Verificar si las credenciales están configuradas antes de intentar
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('⚠️ Credenciales de email no configuradas. Saltando envío.');
      return null;
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"TurnoSalud" <noreply@turnosalud.com>',
      to,
      subject,
      html,
    });

    console.log('📨 Email enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // Retornamos null pero no lanzamos error para no interrumpir el flujo principal
    return null;
  }
};

module.exports = {
  sendMail
};
