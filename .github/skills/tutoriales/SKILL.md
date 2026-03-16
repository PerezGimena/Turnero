---
name: senior-tutoriales-turnosalud
description: >
  Agente Senior en Tutoriales y Manual de Uso para TurnoSalud. Activa este skill para redactar
  guías de usuario, manuales de onboarding, documentación de funcionalidades, FAQs, tooltips
  de la UI, textos de empty states, y cualquier contenido educativo para profesionales de la
  salud que usan el sistema. Escribe en español rioplatense, claro y sin jerga técnica.
---

# Senior Tutoriales — TurnoSalud

## Principios de escritura

- **Español rioplatense**: vos, tu, hacé, configurá
- **Sin jerga técnica**: nunca "endpoint", "token", "CRUD" al usuario
- **Orientado a la tarea**: "¿Cómo confirmar un turno?" no "El módulo de gestión de turnos permite..."
- **Progresivo**: primero lo básico, luego lo avanzado
- **Con capturas imaginadas**: indicar qué mostrar en cada paso

## Estructura del manual de uso

### Módulo 1 — Primeros pasos
```
1.1 Cómo registrarte como profesional
1.2 Completar tu perfil público (foto, especialidad, descripción)
1.3 Configurar tus días y horarios de atención
1.4 Compartir tu link de reserva con pacientes
```

### Módulo 2 — Gestión de turnos
```
2.1 Cómo ver los turnos del día
2.2 Cómo confirmar o rechazar un turno pendiente
2.3 Cómo crear un turno manualmente
2.4 Cómo cancelar un turno y notificar al paciente
2.5 Cómo bloquear horarios (vacaciones, feriados)
```

### Módulo 3 — Tus pacientes
```
3.1 Cómo ver el historial de turnos de un paciente
3.2 Cómo crear un turno para un paciente existente
```

### Módulo 4 — Recordatorios automáticos
```
4.1 Qué son los recordatorios y para qué sirven
4.2 Cómo configurar los recordatorios por email
4.3 Cómo activar los recordatorios por WhatsApp
4.4 Cómo personalizar el mensaje de recordatorio
4.5 Cómo enviar un recordatorio de prueba
```

### Módulo 5 — Pagos
```
5.1 ¿Conviene requerir pago anticipado?
5.2 Cómo conectar MercadoPago
5.3 Cómo conectar Stripe
5.4 Cómo configurar la política de reembolsos
5.5 Cómo ver tus pagos recibidos y exportarlos
```

## Textos de empty states (UI)

```jsx
// Sin turnos pendientes
"No tenés turnos pendientes de confirmación. 
Cuando un paciente reserve, aparecerá acá."

// Sin pacientes
"Todavía no tenés pacientes registrados.
¡Compartí tu link de reserva para empezar!"

// Sin pagos
"Cuando tus pacientes paguen por anticipado,
los verás acá."

// Profesional no encontrado (404)
"Este profesional no está disponible en este momento.
Si creés que hay un error, contactate con él directamente."
```

## Tooltips estándar de la UI

```
Campo "Slug / URL pública":
→ "Esta es la dirección de tu página de reservas. Tus pacientes van a usar este link para reservar."

Toggle "Confirmación automática":
→ "Si lo activás, los turnos se confirman al instante. Si lo desactivás, vas a tener que aprobar cada turno manualmente."

Toggle "Pago obligatorio":
→ "Cuando está activo, el paciente debe pagar antes de confirmar el turno."

Campo "Tiempo de descanso":
→ "Minutos entre un turno y el siguiente. Útil si necesitás tiempo para tomar notas o descansar."
```

## Guía de onboarding (checklist para nuevo profesional)

```
□ Subí tu foto de perfil
□ Completá tu descripción profesional
□ Elegí tu especialidad
□ Configurá tus días y horarios de atención
□ Decidí si querés confirmación automática o manual
□ Configurá los recordatorios automáticos
□ Compartí tu link con tus primeros pacientes
```
