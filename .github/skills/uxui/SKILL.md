---
name: senior-uxui-turnosalud
description: >
  Agente Senior en UX/UI para TurnoSalud. Activa este skill para mejorar la experiencia de usuario,
  diseñar flujos de navegación, revisar accesibilidad, optimizar el mobile del módulo paciente,
  definir microinteracciones, mejorar formularios, diseñar empty states, estados de error y éxito,
  y cualquier decisión de experiencia de usuario en aplicaciones SaaS modernas de salud.
---

# Senior UX/UI — TurnoSalud

## Principios de UX para TurnoSalud

1. **Claridad sobre creatividad** — El paciente no debe dudar en ningún paso
2. **Reducir fricciones** — Menos campos, más defaults inteligentes
3. **Feedback inmediato** — Toda acción tiene respuesta visual
4. **Mobile-first** para pacientes — Desktop-first para profesionales
5. **Confianza visual** — Sector salud requiere diseño que inspire confianza

## Flujos críticos de UX

### Flujo paciente (reserva de turno)
```
Objetivo: Mínima fricción para completar reserva
Pasos: Landing → Calendario → Formulario → Confirmación

Reglas:
□ Máx 3 clics desde la landing hasta seleccionar horario
□ Formulario con máximo 6 campos visibles inicialmente
□ Progreso claro (paso 1/3, paso 2/3, etc.)
□ Nunca perder el contexto (qué turno está reservando)
□ Botón CTA siempre visible (sticky footer en mobile)
□ Error states descriptivos: "Ese horario ya no está disponible"
```

### Flujo profesional (gestión diaria)
```
Objetivo: Ver y gestionar la agenda con mínima carga cognitiva

Dashboard: Vista del día actual siempre al frente
Agenda: Navegación rápida por fechas
Turnos pendientes: Acción rápida — confirmar/rechazar en 1 clic
```

## Patrones de estados de UI

### Estados de carga
```jsx
// Siempre skeletons, nunca spinners
// Dashboard metrics skeleton
<div className="animate-pulse">
  <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
  <div className="h-6 bg-gray-100 rounded w-16" />
</div>
```

### Empty states (siempre con acción)
```jsx
// Con ilustración simple + texto + CTA
<div className="flex flex-col items-center justify-center py-16 text-center">
  <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
  <h3 className="text-gray-600 font-medium">No tenés turnos pendientes</h3>
  <p className="text-gray-400 text-sm mt-1">Cuando un paciente reserve, aparecerá acá</p>
</div>
```

### Estados de error en formularios
```jsx
// Mensaje específico, no genérico
// ❌ "Campo inválido"
// ✅ "El teléfono debe tener formato +54 seguido de 10 dígitos"

<p className="text-red-500 text-sm mt-1">{errors.telefono?.message}</p>
```

### Confirmaciones destructivas
```
Siempre usar ModalConfirmarAccion antes de:
- Cancelar un turno
- Eliminar datos
- Rechazar un turno

Patrón: "¿Estás seguro?" + descripción consecuencia + [Cancelar] [Confirmar acción]
```

## Accesibilidad (a11y)

```
✅ Contraste mínimo 4.5:1 en texto sobre fondo
✅ Focus visible en todos los inputs (ring de Tailwind)
✅ Labels asociados a inputs (htmlFor + id)
✅ Aria-labels en íconos sin texto
✅ Mensajes de error asociados al campo (aria-describedby)
✅ Botones con texto descriptivo (no solo iconos en acciones importantes)
```

## Responsive — Módulo Paciente (obligatorio)

```
Breakpoints críticos:
- Mobile (< 640px): Formulario full width, calendario simplificado
- Tablet (640-1024px): Layout de dos columnas en calendario
- Desktop (> 1024px): Layout completo

Reglas móvil:
□ Botones de al menos 44px de alto (touch target)
□ Texto mínimo 16px para evitar zoom en iOS
□ Sin tablas — usar cards en mobile
□ Bottom navigation si hay múltiples acciones
```

## Copywriting de la UI

```
Tono: Cálido, directo, en español rioplatense
Verbos de acción: Reservá, Confirmá, Cancelá, Editá, Guardá

// ❌ Genérico
"Submit" | "Click here" | "Error occurred"

// ✅ Específico y humano
"Reservar turno →" | "Ver turnos disponibles" | "No pudimos conectar con el servidor. Intentá de nuevo."
```

## Microinteracciones

```
Hover en cards: shadow-md transition-shadow duration-150
Click en chips de horario: scale-95 + ring
Botones loading: spinner inline + texto "Reservando..."
Toast success: slide-in desde abajo, color verde, 3 segundos
Toast error: slide-in desde abajo, color rojo, 5 segundos (más tiempo para leer)
Modal open: fade-in + slide-up sutil
```
