const { sendMail } = require('../config/mailer');

const styles = `
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const headerStyle = `
  background-color: #2563eb;
  color: white;
  padding: 15px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px;
`;

/**
 * Envía email de turno confirmado
 */
const enviarConfirmacionReserva = async (turno, paciente, profesional) => {
  const subject = `Reserva Confirmada - ${profesional.nombre} ${profesional.apellido}`;
  
  const html = `
    <div style="${styles}">
      <div style="${headerStyle}">
        <h2>¡Tu turno está confirmado!</h2>
      </div>
      <p>Hola <strong>${paciente.nombre}</strong>,</p>
      <p>Te confirmamos que tu turno con <strong>${profesional.nombre} ${profesional.apellido}</strong> ha sido reservado exitosamente.</p>
      
      <h3>Detalles del turno:</h3>
      <ul>
        <li><strong>Fecha:</strong> ${turno.fecha}</li>
        <li><strong>Hora:</strong> ${turno.horaInicio} hs</li>
        <li><strong>Modalidad:</strong> ${turno.modalidad}</li>
        <li><strong>Referencia:</strong> ${turno.referencia}</li>
      </ul>

      <p>Si necesitás cancelar o reprogramar, podés hacerlo desde el siguiente enlace:</p>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_DOMAIN}/turno/${turno.referencia}" style="${buttonStyle}">Gestionar mi Turno</a>
      </div>

      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Saludos,<br>
        El equipo de TurnoSalud
      </p>
    </div>
  `;

  await sendMail({ to: paciente.email, subject, html });
};

/**
 * Envía email de solicitud pendiente de aprobación
 */
const enviarNotificacionPendiente = async (turno, paciente, profesional) => {
  const subject = `Solicitud de Turno Recibida - ${profesional.nombre} ${profesional.apellido}`;
  
  const html = `
    <div style="${styles}">
      <div style="${headerStyle}">
        <h2>Solicitud Recibida</h2>
      </div>
      <p>Hola <strong>${paciente.nombre}</strong>,</p>
      <p>Recibimos tu solicitud de turno con <strong>${profesional.nombre} ${profesional.apellido}</strong>.</p>
      
      <p>El profesional debe aprobar tu solicitud. Te avisaremos por este medio cuando el estado cambie.</p>
      
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
  `;

  await sendMail({ to: paciente.email, subject, html });
};

/**
 * Recordatorio de turno próximo (job programado o manual)
 */
const enviarRecordatorioProximoTurno = async (turno, paciente, profesional) => {
  const subject = `Recordatorio de Turno - ${profesional.nombre} ${profesional.apellido}`;
  
  const html = `
    <div style="${styles}">
      <div style="${headerStyle}">
        <h2>¡No olvides tu turno!</h2>
      </div>
      <p>Hola <strong>${paciente.nombre}</strong>,</p>
      <p>Te recordamos que tenés un turno próximo con <strong>${profesional.nombre} ${profesional.apellido}</strong>.</p>
      
      <h3>Cuándo:</h3>
      <p style="font-size: 1.2em; font-weight: bold;">
        ${turno.fecha} a las ${turno.horaInicio} hs
      </p>
      
      <p>Dirección / Link: ${turno.modalidad === 'virtual' ? (profesional.linkVideollamada || 'Se enviará link') : (profesional.direccion || 'Consultorio')}</p>

      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Te esperamos,<br>
        TurnoSalud
      </p>
    </div>
  `;

  await sendMail({ to: paciente.email, subject, html });
};

module.exports = {
  enviarConfirmacionReserva,
  enviarNotificacionPendiente,
  enviarRecordatorioProximoTurno
};
