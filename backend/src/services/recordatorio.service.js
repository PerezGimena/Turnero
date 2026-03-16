const { sendMail } = require('../config/mailer');
const { enviarWhatsApp } = require('./whatsapp.service');
const { ConfiguracionRecordatorios } = require('../models');

const getStyles = () => `
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const getHeaderStyle = (color = '#2563eb') => `
  background-color: ${color};
  color: white;
  padding: 15px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`;

const getButtonStyle = () => `
  display: inline-block;
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px;
`;

// Helper para obtener configuración y valores por defecto
const getConfig = async (profesionalId) => {
  const config = await ConfiguracionRecordatorios.findOne({ where: { profesionalId } });
  // Si no existe config, retornamos valores por defecto seguros
  return config || { 
    emailHabilitado: true, 
    mensajeEmail: null, 
    recordatorioAusencia: false, 
    mensajeAusencia: null 
  };
};

/**
 * 1. Email al paciente cuando se crea un turno confirmado
 */
const enviarConfirmacionReserva = async (turno, paciente, profesional) => {
  try {
    const config = await getConfig(profesional.id);
    if (!config.emailHabilitado) return;

    const subject = `Reserva Confirmada - ${profesional.nombre} ${profesional.apellido}`;
    
    // Mensaje base, se podría extender con config.mensajeEmail si se quisiera, 
    // pero usualmente mensajeEmail es para recordatorios.
    // Aquí usamos un template fijo profesional.
    
    const html = `
      <div style="${getStyles()}">
        <div style="${getHeaderStyle('#2563eb')}">
          <h2>¡Tu turno está confirmado!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola <strong>${paciente.nombre}</strong>,</p>
          <p>Te confirmamos que tu turno con <strong>${profesional.nombre} ${profesional.apellido}</strong> ha sido reservado exitosamente.</p>
          
          <h3>Detalles del turno:</h3>
          <ul>
            <li><strong>Fecha:</strong> ${turno.fecha}</li>
            <li><strong>Hora:</strong> ${turno.horaInicio} hs</li>
            <li><strong>Modalidad:</strong> ${turno.modalidad}</li>
            <li><strong>Referencia:</strong> ${turno.referencia}</li>
          </ul>

          <p>Si necesitás cancelar o reprogramar, por favor hacelo con anticipación.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.APP_DOMAIN}/turno/${turno.referencia}" style="${getButtonStyle()}">Gestionar mi Turno</a>
          </div>

          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Saludos,<br>
            El equipo de TurnoSalud
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: paciente.email, subject, html });
  } catch (error) {
    console.error('Error enviando confirmación:', error);
  }
};

/**
 * 2. Email al paciente cuando el turno queda en estado pendiente
 */
const enviarNotificacionPendiente = async (turno, paciente, profesional) => {
  try {
    const config = await getConfig(profesional.id);
    if (!config.emailHabilitado) return;

    const subject = `Solicitud de Turno Recibida - ${profesional.nombre} ${profesional.apellido}`;
    
    const html = `
      <div style="${getStyles()}">
        <div style="${getHeaderStyle('#f59e0b')}">
          <h2>Solicitud Recibida</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola <strong>${paciente.nombre}</strong>,</p>
          <p>Recibimos tu solicitud de turno con <strong>${profesional.nombre} ${profesional.apellido}</strong>.</p>
          
          <p>El profesional debe aprobar tu solicitud. Te notificaremos por este medio cuando el turno sea confirmado.</p>
          
          <h3>Detalles de la solicitud:</h3>
          <ul>
            <li><strong>Fecha solicitada:</strong> ${turno.fecha}</li>
            <li><strong>Hora:</strong> ${turno.horaInicio} hs</li>
          </ul>

          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Saludos,<br>
            El equipo de TurnoSalud
          </p>
        </div>
      </div>
    `;

    await sendMail({ to: paciente.email, subject, html });
  } catch (error) {
    console.error('Error enviando notificación pendiente:', error);
  }
};

/**
 * 3. Email de recordatorio previo al turno
 */
const enviarRecordatorio = async (turno, paciente, profesional) => {
  try {
    const config = await getConfig(profesional.id);

    const subject = `Recordatorio de Turno - ${profesional.nombre} ${profesional.apellido}`;
    
    // Usar mensaje personalizado si existe
    const mensajeCuerpo = config.mensajeEmail 
      ? `<p style="white-space: pre-wrap;">${config.mensajeEmail}</p>` 
      : `<p>Te recordamos que tenés un turno próximo. Por favor, recordá asistir puntual.</p>`;

    const direccionInfo = turno.modalidad === 'virtual' 
      ? (profesional.linkVideollamada ? `<p><strong>Link:</strong> <a href="${profesional.linkVideollamada}">${profesional.linkVideollamada}</a></p>` : '<p>Se enviará el link de conexión.</p>') 
      : (profesional.direccion ? `<p><strong>Dirección:</strong> ${profesional.direccion}</p>` : '');

    const html = `
      <div style="${getStyles()}">
        <div style="${getHeaderStyle('#2563eb')}">
          <h2>¡No olvides tu turno!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola <strong>${paciente.nombre}</strong>,</p>
          <p>Te recordamos tu turno con <strong>${profesional.nombre} ${profesional.apellido}</strong>.</p>
          
          ${mensajeCuerpo}
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 1.1em; font-weight: bold; margin: 0;">
              ${turno.fecha} a las ${turno.horaInicio} hs
            </p>
            <p style="margin: 5px 0 0 0;">Modalidad: ${turno.modalidad}</p>
            ${direccionInfo}
          </div>

          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Te esperamos,<br>
            TurnoSalud
          </p>
        </div>
      </div>
    `;

    if (config.emailHabilitado) {
      await sendMail({ to: paciente.email, subject, html });
    }

    // Canal WhatsApp (si está habilitado y el paciente tiene teléfono)
    if (config.whatsappHabilitado && paciente.telefono && paciente.aceptaRecordatorios) {
      const mensajeWA = config.mensajeWhatsapp
        ? _interpolarVariables(config.mensajeWhatsapp, { turno, paciente, profesional })
        : `⏰ Recordatorio de turno\nHola ${paciente.nombre}, te recordamos tu turno con ${profesional.nombre} ${profesional.apellido}\n📅 ${turno.fecha} a las ${turno.horaInicio} hs\nModalidad: ${turno.modalidad}`;
      await enviarWhatsApp(paciente.telefono, mensajeWA).catch((e) =>
        console.error('[WhatsApp] Error en recordatorio:', e.message)
      );
    }
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
  }
};

/**
 * 4. Email cuando el turno se marca como ausente
 */
const enviarNotificacionAusencia = async (turno, paciente, profesional) => {
  try {
    const config = await getConfig(profesional.id);
    
    // Validar si está habilitado y si quiere enviar aviso de ausencia
    if (!config.recordatorioAusencia) return;

    const subject = `Ausencia en Turno - ${profesional.nombre} ${profesional.apellido}`;
    
    // Mensaje custom o default
    const mensajeCuerpo = config.mensajeAusencia 
      ? `<p style="white-space: pre-wrap;">${config.mensajeAusencia}</p>` 
      : `<p>Hemos notado tu ausencia en el turno programado. Si deseas reprogramar, por favor contáctanos.</p>`;

    const html = `
      <div style="${getStyles()}">
        <div style="${getHeaderStyle('#ef4444')}">
          <h2>Ausencia registrada</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola <strong>${paciente.nombre}</strong>,</p>
          
          ${mensajeCuerpo}
          
          <p style="margin-topt: 15px;"><strong>Turno del:</strong> ${turno.fecha} a las ${turno.horaInicio} hs</p>

          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Saludos,<br>
            TurnoSalud
          </p>
        </div>
      </div>
    `;

    if (config.emailHabilitado) {
      await sendMail({ to: paciente.email, subject, html });
    }

    // Canal WhatsApp (si está habilitado)
    if (config.whatsappHabilitado && paciente.telefono && paciente.aceptaRecordatorios) {
      const mensajeWA = config.mensajeAusencia
        ? _interpolarVariables(config.mensajeAusencia, { turno, paciente, profesional })
        : `✋ Registramos tu ausencia al turno del ${turno.fecha} a las ${turno.horaInicio} hs con ${profesional.nombre} ${profesional.apellido}. Si deseás reprogramar, contactanos.`;
      await enviarWhatsApp(paciente.telefono, mensajeWA).catch((e) =>
        console.error('[WhatsApp] Error en ausencia:', e.message)
      );
    }
  } catch (error) {
    console.error('Error enviando notificación ausencia:', error);
  }
};

// Helper interno para interpolar variables en mensajes personalizados
const _interpolarVariables = (mensaje, { turno, paciente, profesional }) => {
  if (!mensaje) return '';
  return mensaje
    .replace(/\{\{nombre\}\}/g,       paciente.nombre || '')
    .replace(/\{\{apellido\}\}/g,     paciente.apellido || '')
    .replace(/\{\{fecha\}\}/g,        turno.fecha || '')
    .replace(/\{\{hora\}\}/g,         turno.horaInicio || '')
    .replace(/\{\{profesional\}\}/g,  `${profesional.nombre} ${profesional.apellido}`)
    .replace(/\{\{especialidad\}\}/g, profesional.especialidad || '')
    .replace(/\{\{direccion\}\}/g,    profesional.direccion || '')
    .replace(/\{\{duracion\}\}/g,     String(turno.duracion || profesional.duracionTurno || ''));
};

module.exports = {
  enviarConfirmacionReserva,
  enviarNotificacionPendiente,
  enviarRecordatorio,
  enviarNotificacionAusencia
};
