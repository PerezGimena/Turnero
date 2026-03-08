---
name: senior-saas-turnosalud
description: >
  Agente Senior en Sistemas SaaS para TurnoSalud. Activa este skill para decisiones de
  arquitectura multi-tenant, gestión de planes y suscripciones, onboarding de nuevos
  profesionales, métricas de negocio SaaS (MRR, churn, retención), administración de cuentas
  desde el panel Admin, impersonación de usuarios para soporte, y cualquier requerimiento
  relacionado con el modelo de negocio SaaS B2B del producto.
---

# Senior SaaS — TurnoSalud

## Modelo de negocio

TurnoSalud es un **SaaS B2B** donde:
- **Cliente:** Profesional de la salud (médico, psicólogo, etc.)
- **Usuario final:** Paciente del profesional
- **Admin:** Equipo TurnoSalud (gestiona la plataforma)

## Arquitectura multi-tenant

```
Modelo: Multi-tenant con aislamiento por profesionalId
- Cada Profesional es un tenant
- Sus datos (Pacientes, Turnos, Pagos) están aislados por profesionalId
- Los pacientes NO tienen cuenta propia en el sistema
- Un paciente puede existir en múltiples profesionales (sin crossover de datos)

NO se usa:
- Schemas separados por tenant
- Bases de datos separadas
- Solo Row-Level Security por profesionalId
```

## Planes y suscripciones

```
Campos en Profesionales:
- planActivo: boolean (activo/inactivo)
// TODO: Implementar modelo de planes completo

Planes futuros a implementar:
Plan Básico:
  - Hasta X turnos/mes
  - Email recordatorios
  - Sin WhatsApp
  - Sin pagos online

Plan Pro:
  - Turnos ilimitados
  - Email + WhatsApp
  - Pagos online (MP + Stripe)
  - Exportar CSV
  - Personalización avanzada
```

## Panel Admin — Funcionalidades implementadas

```
/admin/login             → Login exclusivo (sin registro público)
/admin/dashboard         → Métricas globales del SaaS
/admin/profesionales     → CRUD de profesionales

Métricas globales disponibles:
- Total profesionales activos
- Turnos creados este mes
- Tasa de asistencia global
- Nuevos registros esta semana
- Profesionales con plan activo
```

## Funcionalidad de impersonación

```
POST /api/admin/profesionales/:id/impersonar
→ Genera JWT del profesional para soporte
→ El admin puede loguearse como ese profesional
→ Útil para debugging y soporte técnico
→ ⚠️ Registrar en log quién impersonó a quién y cuándo
```

## Métricas SaaS a implementar

```javascript
// KPIs básicos del SaaS
{
  mrr: 'Ingresos mensuales recurrentes',
  churn: 'Tasa de bajas de profesionales',
  nps: 'Net Promoter Score',
  dau: 'Profesionales activos diarios',
  avgTurnosPorProfesional: 'Engagement promedio',
  conversionRate: 'Trial → Plan pago'
}
```

## Onboarding de nuevo profesional

```
Flujo actual:
1. POST /api/auth/profesional/registro
2. Sistema genera slug automático (nombre-apellido)
3. Crea ConfiguracionDias (7 días, todos deshabilitados por default)
4. Crea ConfiguracionRecordatorios (con defaults)
5. Profesional queda con planActivo: true (trial gratuito)

Flujo ideal (a implementar):
6. Email de bienvenida con instrucciones
7. Checklist de setup en dashboard (completar perfil, habilitar días, etc.)
8. Primer turno = hito de activación
```

## Reglas críticas SaaS

- ❌ NO dar acceso a datos de otros profesionales nunca
- ❌ NO permitir que un profesional inactivo reciba reservas
- ✅ Verificar `planActivo` antes de permitir acciones premium
- ✅ Registrar en logs todas las acciones de admin/impersonación
- ✅ El admin nunca puede ver passwords, solo resetearlos
