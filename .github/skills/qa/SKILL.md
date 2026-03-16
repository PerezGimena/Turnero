---
name: senior-qa-turnosalud
description: >
  Agente Senior QA Testing para TurnoSalud. Activa este skill para validar implementaciones,
  detectar bugs, escribir casos de prueba, revisar edge cases, probar flujos end-to-end,
  validar que los ENUMs sean correctos, verificar respuestas de API, revisar que no haya
  regresiones, y mantener la tabla de issues en AGENT.md actualizada. Especialista en QA
  para sistemas SaaS de salud con foco en integridad de datos y UX crítica.
---

# Senior QA — TurnoSalud

## Checklist de validación por área

### Backend — Checklist API

```
□ ¿El endpoint devuelve el status code correcto? (200, 201, 400, 401, 404, 500)
□ ¿Se excluye passwordHash de todas las respuestas?
□ ¿Las validaciones Zod rechazan datos inválidos?
□ ¿Los ENUMs usan minúsculas? (presencial, lunes, pendiente)
□ ¿El JWT se verifica en rutas protegidas?
□ ¿Los errores van por next(error) al errorHandler?
□ ¿La paginación funciona correctamente (limit/offset)?
□ ¿Las FKs existen antes de insertar registros relacionados?
```

### Frontend — Checklist UI

```
□ ¿Los formularios muestran errores de validación?
□ ¿El estado de carga muestra skeleton (no spinner)?
□ ¿Los toasts aparecen en errores de API?
□ ¿Las rutas protegidas redirigen si no hay token?
□ ¿El calendario funciona en mobile?
□ ¿Los modales se cierran correctamente?
□ ¿El sidebar tiene todos los links activos?
□ ¿Las fechas usan date-fns con locale es?
□ ¿No hay texto en inglés en la UI?
```

### Base de Datos — Checklist integridad

```
□ ¿Los ENUMs están en minúsculas en seed y en controllers?
□ ¿Las FKs tienen ON DELETE apropiado?
□ ¿Los campos UNIQUE realmente son únicos?
□ ¿Los NOT NULL tienen valores default o validación upstream?
□ ¿El slug es único tras generación automática?
```

## Issues conocidos activos (al 08/03/2026)

| ID | Prioridad | Descripción | Estado |
|----|-----------|-------------|--------|
| QA-001 | 🔴 Alta | `ConfiguracionRecordatorios` no importado en admin.controller | Abierto |
| QA-002 | 🔴 Alta | Sin `ProtectedRoute` — rutas privadas accesibles sin token | Abierto |
| QA-003 | 🔴 Alta | `modalidad` con mayúscula en auth.controller | Abierto |
| QA-004 | 🔴 Alta | Seeder inserta días con mayúscula | Abierto |
| QA-005 | 🟡 Media | Sidebar no muestra link a pagos-recibidos | Abierto |
| QA-006 | 🟡 Media | AdminLayout rutas /admin/metricas y /admin/soporte sin página | Abierto |
| QA-007 | 🟡 Media | Dashboard no usa TanStack Query | Abierto |
| QA-008 | 🟢 Baja | NotFoundPage es inline sin página real | Abierto |

## Flujos críticos a probar end-to-end

### Flujo reserva de turno (paciente)
```
1. GET /:slug → página carga correctamente
2. GET /:slug/reservar → calendario muestra días habilitados
3. Seleccionar día → aparecen horarios disponibles
4. GET /:slug/reservar/formulario → formulario renderiza
5. Submit con datos válidos → redirige según confirmacionAutomatica
6. Si automático → /:slug/reservar/confirmado
7. Si manual → /:slug/reservar/pendiente
```

### Flujo login profesional
```
1. POST /api/auth/profesional/login con credenciales válidas → JWT
2. Token se guarda en Zustand (localStorage 'turnosalud-auth')
3. GET /profesional/dashboard → carga con métricas reales
4. Logout → token eliminado, redirect a login
5. Intento de acceso sin token → redirect a login (pendiente implementar)
```

### Flujo confirmación de turno
```
1. GET /profesional/turnos-pendientes → lista turnos estado 'pendiente'
2. PATCH /profesional/turnos/:id/confirmar → estado → 'confirmado'
3. PATCH /profesional/turnos/:id/rechazar → requiere motivo → estado → 'cancelado'
```

## Template para reportar nuevo issue

```markdown
| ⚠️ [Descripción corta] | [Detalle técnico de la falla] | [🔴/🟡/🟢] |
```

Siempre agregar el issue a la tabla en AGENT.md bajo "PENDIENTES / ISSUES CONOCIDOS".

## Criterios de cierre de issue

Un issue se marca como resuelto cuando:
1. El código fix está implementado
2. El flujo afectado fue probado manualmente
3. No hay regresiones en flujos relacionados
4. AGENT.md está actualizado con el fix
