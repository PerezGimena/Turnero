---
name: senior-automatizacion-turnosalud
description: >
  Agente Senior en Automatización para TurnoSalud. Activa este skill para implementar recordatorios
  automáticos por email y WhatsApp, jobs programados (cron), triggers de eventos (turno confirmado,
  cancelado, ausente), envío de notificaciones, automatización del flujo de confirmación, detección
  automática de ausencias, y cualquier proceso que deba ejecutarse sin intervención manual.
---

# Senior Automatización — TurnoSalud

## Procesos automáticos del sistema

### 1. Recordatorios de turno
```
Trigger: Cron job que corre cada hora
Lógica:
  1. Buscar Turnos con estado 'confirmado' en el futuro próximo
  2. Para cada turno, verificar ConfiguracionRecordatorios del profesional
  3. Si horasAntes coincide con la ventana actual → enviar recordatorio
  4. Verificar que paciente.aceptaRecordatorios = true
  5. Enviar por email (siempre) y/o WhatsApp (si está configurado)

Canales:
  - Email: Nodemailer → SMTP configurado en config/mailer.js
  - WhatsApp: API externa (configurar en VITE_WHATSAPP_API_URL)
```

### 2. Detección de ausencias
```
Trigger: Cron job que corre cada 30 minutos
Lógica:
  1. Buscar Turnos confirmados cuya horaFin ya pasó
  2. Si el turno no fue marcado como 'completado' → marcar 'ausente'
  3. Si recordatorioAusencia = true → enviar mensaje de ausencia al paciente
  
Margen: 15 minutos de gracia después de horaFin antes de marcar ausente
```

### 3. Confirmación automática
```
Trigger: Al crear turno (POST /publico/:slug/reservar)
Lógica:
  Si profesional.confirmacionAutomatica = true:
    → turno.estado = 'confirmado' inmediatamente
    → Enviar email de confirmación al paciente
  Si false:
    → turno.estado = 'pendiente'
    → Enviar email "Tu turno está pendiente de confirmación"
```

### 4. Notificación al confirmar/rechazar manualmente
```
Trigger: PATCH /profesional/turnos/:id/confirmar o /rechazar
Al confirmar:
  → Email al paciente: "Tu turno fue confirmado"
  → Si pagoObligatorio: incluir link de pago
Al rechazar:
  → Email al paciente: "Tu turno fue rechazado" + motivo
```

## Implementación del servicio de recordatorios

```js
// services/recordatorio.service.js

export const enviarRecordatorio = async (turno, tipo) => {
  const profesional = await Profesional.findByPk(turno.profesionalId, {
    include: [ConfiguracionRecordatorios]
  })
  const paciente = await Paciente.findByPk(turno.pacienteId)
  
  if (!paciente.aceptaRecordatorios) return
  
  const config = profesional.ConfiguracionRecordatorio
  
  const vars = {
    nombre: paciente.nombre,
    fecha: format(turno.fecha, 'EEEE d MMMM', { locale: es }),
    hora: turno.horaInicio,
    profesional: `${profesional.nombre} ${profesional.apellido}`,
    direccion: profesional.direccion || ''
  }
  
  // Reemplazar variables en mensaje
  const mensaje = interpolarVariables(config.mensajeEmail, vars)
  
  if (config.emailHabilitado) {
    await mailer.sendMail({ to: paciente.email, subject: '...', html: mensaje })
  }
  
  if (config.whatsappHabilitado && config.whatsappNumero) {
    await enviarWhatsApp(paciente.telefono, interpolarVariables(config.mensajeWhatsapp, vars))
  }
}
```

## Configuración de cron jobs

```js
// services/cron.service.js
import cron from 'node-cron'

// Recordatorios — cada hora
cron.schedule('0 * * * *', async () => {
  await procesarRecordatoriosPendientes()
})

// Detección de ausencias — cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  await detectarAusencias()
})
```

## Variables de mensaje — tokens disponibles

```
{{nombre}}       → paciente.nombre
{{apellido}}     → paciente.apellido
{{fecha}}        → Formato: "lunes 15 de marzo"
{{hora}}         → "10:30"
{{profesional}}  → "Dr. Juan Pérez"
{{especialidad}} → "Médico Clínico"
{{direccion}}    → profesional.direccion
{{duracion}}     → "30 minutos"
```

## Reglas críticas

- ✅ Verificar `aceptaRecordatorios` SIEMPRE antes de enviar
- ✅ Loggear cada envío (éxito o error) para debugging
- ✅ No enviar más de un recordatorio del mismo tipo al mismo turno
- ✅ Marcar recordatorios como enviados para evitar duplicados
- ❌ NO enviar mensajes sin que el paciente haya dado consentimiento
