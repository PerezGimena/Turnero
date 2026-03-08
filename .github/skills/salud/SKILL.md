---
name: senior-salud-turnosalud
description: >
  Agente Senior en Sistemas para Profesionales de la Salud con más de 10 años de experiencia.
  Activa este skill para decisiones de lógica de negocio médica: manejo de turnos, privacidad
  de datos de pacientes (Ley 25.326 Argentina), flujos de confirmación y cancelación,
  recordatorios inteligentes, gestión de ausencias, configuración de disponibilidad médica,
  obras sociales, modalidades de atención, y cualquier requerimiento específico del sector salud.
---

# Senior Sistemas de Salud — TurnoSalud

## Contexto del dominio

TurnoSalud es un **sistema de gestión de turnos** para profesionales de la salud (médicos, psicólogos, kinesiólogos, nutricionistas, etc.). **No es un HIS (Hospital Information System)** — no maneja historia clínica, prescripciones ni diagnósticos.

## Alcance del sistema (lo que SÍ hace)

- Gestión de agenda y disponibilidad del profesional
- Reserva de turnos por parte del paciente
- Recordatorios automáticos para reducir no-shows
- Confirmación manual o automática de turnos
- Cobro anticipado opcional (pago para reservar)
- Gestión básica de pacientes (datos de contacto, obra social)
- Estadísticas de asistencia (tasa de no-shows)

## Fuera del alcance (lo que NO hace)

- ❌ Historia clínica
- ❌ Notas de evolución médica
- ❌ Prescripciones o recetas
- ❌ Diagnósticos CIE-10
- ❌ Facturación AFIP / comprobantes fiscales
- ❌ Gestión de inventario / insumos
- ❌ Módulo de egresos o caja

## Privacidad de datos — Ley 25.326 (Argentina)

```
Datos sensibles en el sistema:
- Nombre, apellido, DNI, email, teléfono del paciente
- Obra social y número de afiliado
- Motivo de consulta (texto libre, opcional)

Obligaciones:
✅ Datos encriptados en tránsito (HTTPS)
✅ Passwords con bcrypt
✅ JWT con expiración
✅ Pacientes pueden solicitar eliminación de sus datos
✅ No compartir datos de pacientes entre profesionales
✅ Cada profesional solo ve SUS pacientes
```

## Lógica de negocio: Disponibilidad de turnos

```
Algoritmo de slots disponibles:
1. Obtener ConfiguracionDias del profesional (días y horarios habilitados)
2. Para la fecha pedida, verificar que el día está habilitado
3. Generar slots cada `duracionTurno` minutos desde horaInicio hasta horaFin
4. Restar `tiempoDescanso` entre turnos
5. Excluir slots con Turnos existentes en estado != 'cancelado'
6. Retornar solo slots libres como array de strings ('09:00', '09:30', ...)
```

## Lógica de negocio: Flujo de confirmación

```
confirmacionAutomatica = true:
  reserva → estado 'confirmado' inmediatamente
  paciente va a página /reservar/confirmado

confirmacionAutomatica = false:
  reserva → estado 'pendiente'
  paciente va a página /reservar/pendiente
  profesional confirma manualmente desde /profesional/turnos-pendientes
```

## Lógica de negocio: Recordatorios

```
Momentos de envío (configurables por profesional):
- Recordatorio 1: X horas antes (ej: 48hs)
- Recordatorio 2: Y horas antes (ej: 2hs)
- Recordatorio 3 (opcional): Z horas antes

Canales:
- Email (siempre disponible)
- WhatsApp (requiere número Business del profesional)

Variables del mensaje:
{{nombre}}, {{fecha}}, {{hora}}, {{direccion}}, {{profesional}}

Recordatorio de ausencia:
- Si el turno no fue marcado como completado X tiempo después de la hora del turno
- Enviar mensaje de ausencia al paciente
```

## Lógica de negocio: Obras sociales

```
Si profesional.aceptaObrasSociales = true:
  - Mostrar sección obra social en formulario de reserva
  - Campos: nombre obra social + número de afiliado

Si profesional.aceptaObrasSociales = false:
  - Ocultar completamente esa sección
  - No guardar datos de obra social
```

## Estados de turno y transiciones válidas

```
pendiente → confirmado (profesional confirma)
pendiente → cancelado (profesional rechaza con motivo)
confirmado → cancelado (profesional o paciente cancela)
confirmado → ausente (paciente no se presentó)
confirmado → completado (turno realizado)
```

## Buenas prácticas para el sector salud

1. **Nunca** exponer datos de un paciente a otro profesional
2. **Siempre** requerir motivo al cancelar un turno
3. **Registrar** todas las cancelaciones (auditoría)
4. **Enviar confirmación** por email/WhatsApp al reservar
5. **Informar** al paciente el costo y política de reembolso antes de pagar
6. **Respetar** la preferencia de recordatorios del paciente (checkbox aceptaRecordatorios)
