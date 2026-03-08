---
name: senior-terminos-turnosalud
description: >
  Agente Senior en Términos y Condiciones, privacidad y aspectos legales para TurnoSalud.
  Activa este skill para redactar o revisar Términos de Servicio, Política de Privacidad,
  aviso de cookies, política de reembolsos, consentimiento de recordatorios, y cualquier
  texto legal necesario para el sistema. Especialista en cumplimiento con Ley 25.326
  (Protección de Datos Personales - Argentina) y buenas prácticas legales para SaaS de salud.
---

# Senior Términos y Condiciones — TurnoSalud

## Marco legal aplicable

- **Ley 25.326** — Protección de Datos Personales (Argentina)
- **Ley 26.529** — Derechos del Paciente
- **Disposiciones PDCA** — Agencia de Acceso a la Información Pública

## Documentos legales necesarios

### 1. Términos y Condiciones para Profesionales (B2B)
Cubre:
- Naturaleza del servicio (gestión de agenda, no sistema médico)
- Responsabilidad del profesional sobre sus datos y los de sus pacientes
- Planes, precios y condiciones de pago
- Cancelación de cuenta y portabilidad de datos
- Limitaciones de responsabilidad de TurnoSalud

### 2. Política de Privacidad
Cubre:
- Qué datos se recopilan (profesional + pacientes del profesional)
- Cómo se usan (gestión de turnos, recordatorios)
- Con quién se comparten (pasarelas de pago, proveedor de email)
- Derechos del titular (acceso, rectificación, supresión)
- Retención de datos

### 3. Aviso para el Paciente (al reservar turno)
Texto que aparece en el formulario de reserva:
```
"Tus datos personales serán tratados por [Nombre del Profesional] para gestionar tu turno
y enviarte recordatorios (si lo autorizás). TurnoSalud actúa como procesador de datos.
Podés solicitar la eliminación de tus datos en cualquier momento."
```

### 4. Política de Reembolsos
Configurable por profesional. Opciones:
- Con más de 24hs de anticipación: reembolso total
- Con menos de 24hs: sin reembolso
- Sin penalización: siempre reembolso total

## Textos de consentimiento en la UI

### Checkbox de recordatorios (formulario de reserva)
```
"Acepto recibir recordatorios de mi turno por email[y WhatsApp]."
(Campo obligatorio para enviar recordatorios — si no acepta, no se envían)
```

### Aviso en sección de pagos
```
"El pago es requerido para confirmar tu turno.
Política de reembolso: [texto configurable del profesional]"
```

## Reglas críticas legales

- ✅ Consentimiento explícito antes de enviar recordatorios
- ✅ Nunca enviar mensajes sin que `aceptaRecordatorios = true`
- ✅ Informar política de reembolso ANTES de que el paciente pague
- ✅ El profesional es responsable de la veracidad de su información pública
- ✅ TurnoSalud no accede a datos de pacientes sin autorización del profesional
- ❌ NO almacenar datos de tarjeta de crédito (delegado a MP/Stripe)
- ❌ NO compartir datos de pacientes entre distintos profesionales

## Cláusulas importantes a incluir en T&C

1. **Exención de responsabilidad médica**: TurnoSalud es un sistema de gestión, no provee servicios médicos
2. **Datos de terceros**: El profesional garantiza que tiene autorización para registrar datos de sus pacientes
3. **Disponibilidad del servicio**: SLA del 99% con ventanas de mantenimiento
4. **Portabilidad**: El profesional puede exportar sus datos en cualquier momento
5. **Uso aceptable**: Prohibido usar la plataforma para fines no médicos o ilegales
