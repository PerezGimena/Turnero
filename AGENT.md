# Sistema Multi-Agente TurnoSalud

> Arquitectura de agentes IA especializados para el desarrollo del sistema.
> Última actualización del sistema de agentes: 10/03/2026 — Fix admin login (link al panel admin) + índices BD + setup.sql sincronizado + seeders unificados.

---

## ⛔ REGLAS DE CIERRE OBLIGATORIO — NO SALTEAR

> Estas reglas corrigen el problema recurrente: el agente completaba el código pero **nunca actualizaba AGENT.md ni ejecutaba la auditoría de skills**.
> Aplican SIN EXCEPCIÓN al final de cada tarea, sin importar qué tan pequeña sea.

### El agente DEBE hacer esto antes de responder "listo" al usuario:

1. **Agregar entrada al Registro de trabajo** (tabla debajo) con fecha, agente, tarea, archivos y estado.
2. **Actualizar la sección de PENDIENTES** — marcar resueltos y agregar nuevos issues si los hay.
3. **Actualizar el inventario** — si se agregó un archivo nuevo, agregarlo en la sección correspondiente.
4. **Ejecutar Protocolo de Aprendizaje Continuo** — evaluar si el skill usado necesita mejoras. Si detecta un gap, actualizar el SKILL.md afectado y registrar el cambio.
5. **Actualizar la fecha** `Última actualización del sistema de agentes` en la línea de arriba.

### Señales de que se salteó el cierre (PROHIBIDO):
- La última entrada del Registro es anterior a la tarea que acaba de terminar.
- Los issues resueltos siguen figurando como pendientes.
- Un archivo nuevo no aparece en el inventario.
- No hay ningún comentario de auditoría de skill al final de la respuesta.

---

## Cómo trabajar con los agentes

**Siempre activar primero el Coordinador.** El Coordinador lee este archivo, elige el agente correcto y actualiza AGENT.md al finalizar.

## Agentes disponibles

| Skill | Especialidad | Cuándo usarlo |
|-------|-------------|---------------|
| `coordinador/SKILL.md` | Arquitecto — orquesta todos los demás | SIEMPRE primero |
| `backend/SKILL.md` | Express + Sequelize + JWT + Node.js | API, controladores, servicios |
| `frontend/SKILL.md` | React 19 + Vite + Zustand + TanStack | Páginas, componentes, hooks |
| `database/SKILL.md` | MySQL 8 + Sequelize + migraciones | Tablas, modelos, seeds |
| `disenio-web/SKILL.md` | Tailwind v3.4 + Shadcn + paleta | Sistema de diseño, CSS |
| `qa/SKILL.md` | Testing + bugs + flujos | Validaciones, checklist, issues |
| `devops/SKILL.md` | Deploy + CI/CD + vars de entorno | Infraestructura, scripts |
| `salud/SKILL.md` | Lógica médica + Ley 25.326 | Reglas de negocio del sector salud |
| `saas/SKILL.md` | Multi-tenant + planes + onboarding | Modelo SaaS, admin panel |
| `automatizacion/SKILL.md` | Cron + recordatorios + triggers | Jobs automáticos |
| `buenas-practicas/SKILL.md` | SOLID + DRY + naming + refactor | Code review |
| `terminos/SKILL.md` | T&C + privacidad + Ley 25.326 | Textos legales |
| `tutoriales/SKILL.md` | Manual de uso + onboarding docs | Guías de usuario |
| `mercadopago/SKILL.md` | Checkout Pro + webhooks MP | Integración de pagos |
| `cyberseguridad/SKILL.md` | OWASP + JWT + rate limiting | Seguridad del sistema |
| `websocket/SKILL.md` | Socket.io + tiempo real | Notificaciones live |
| `webhook/SKILL.md` | Eventos externos + firma + idempotencia | Webhooks entrantes |
| `uxui/SKILL.md` | Experiencia usuario + accesibilidad | Flujos y UX |
| `modularizacion/SKILL.md` | Separación concerns + estructura | Arquitectura frontend/backend |
| `escalabilidad/SKILL.md` | Performance + caché + crecimiento | Optimización a escala |
| `db-optimizacion/SKILL.md` | Índices + EXPLAIN + N+1 | Queries lentas, normalización |

## Registro de trabajo de agentes

| Fecha | Agente | Tarea | Archivos | Estado |
|-------|--------|-------|----------|--------|
| 08/03/2026 | coordinador | Creación del sistema de skills multi-agente | turnosalud-skills/* | ✅ Completado |
| 2026 | frontend+backend | Fase 7 — Integración API completa todas las páginas | ConfigRecordatoriosPage, ConfigPagosPage, PagosRecibidosPage, GestionProfesionalesPage, DashboardAdminPage, PacientesPage, GestionTurnoPage + admin.controller (updateProfesional) + publico.controller (getTurno/cancelar/reprogramar) | ✅ Completado |
| 09/03/2026 | coordinador+backend | Auditoría y corrección de endpoints faltantes — 2 fixes críticos | backend/src/routes/profesional.routes.js | ✅ Completado |
| 09/03/2026 | coordinador+frontend+backend | Implementación completa de funcionalidades pendientes: NotFoundPage, modales PacientesPage (Nuevo Turno + Enviar Mensaje), validación credenciales pago, 3 endpoints nuevos backend | NotFoundPage.jsx, pages/index.jsx, PacientesPage.jsx, ConfigPagosPage.jsx, profesional.controller.js, profesional.routes.js | ✅ Completado |
| 09/03/2026 | coordinador+backend+automatizacion+mercadopago | WhatsApp (Twilio) + MercadoPago Checkout Pro SaaS completo + Cron jobs | config/whatsapp.js, services/whatsapp.service.js, services/pago.service.js, services/cron.service.js, controllers/webhook.controller.js, routes/webhook.routes.js, routes/index.js, routes/publico.routes.js, controllers/publico.controller.js, services/recordatorio.service.js, server.js, .env.example | ✅ Completado |
| 09/03/2026 | coordinador+backend+database | Flujo `require_payment_to_confirm`: estado `pendiente_pago` + integración MP en `crearReserva` + respuesta con `pagoUrl` | models/Turno.js, database/migrations/20240008-add-pendiente-pago-to-turnos.js, services/turno.service.js, controllers/publico.controller.js | ✅ Completado |
| 09/03/2026 | coordinador+frontend+backend | OAuth MercadoPago: reemplazar input Access Token por flujo OAuth2. Fix WhatsApp toggle (handleToggle no definido). Nuevos endpoints: `GET /profesional/pagos-credenciales/mp-oauth-url` (protected) + `GET /mp/oauth/callback` (public). Callback usa JWT en `state` para identificar profesional sin sesión. | ConfigPagosPage.jsx, ConfigRecordatoriosPage.jsx, profesional.controller.js, routes/index.js, profesional.routes.js, .env.example | ✅ Completado |
| 09/03/2026 | coordinador+frontend+backend | Fix 503 en mp-oauth-url: backend retorna `oauthDisponible` flag en `GET /pagos-credenciales`. Frontend muestra botón OAuth si disponible, input manual (Access Token) como fallback si no hay `MP_CLIENT_ID`/`MP_CLIENT_SECRET` en `.env`. | ConfigPagosPage.jsx, profesional.controller.js | ✅ Completado |
| 09/03/2026 | coordinador+frontend | Eliminado Access Token manual de ConfigPagosPage: UI siempre muestra botón OAuth "Conectar con MercadoPago". Si `oauthDisponible=false` se muestra mensaje amigable de admin-setup (sin terminología técnica). Limpiada `validarCredenciales()` a Stripe-only. Eliminado estado `mpAccessToken`. | ConfigPagosPage.jsx | ✅ Completado |
| 09/03/2026 | coordinador+backend+frontend | OAuth Stripe Connect OAuth 2.0 Authorization Code Flow completo. Backend: `getStripeOAuthUrl` + `stripeOAuthCallback` con JWT state. Rutas: `GET /pagos-credenciales/stripe-oauth-url` (protected) + `GET /stripe/oauth/callback` (public). Frontend: reemplazados inputs manuales `sk_/pk_` por botón "Conectar con Stripe" igual que MP. `stripeOauthDisponible` desde backend. Eliminados `stripePublishableKey`, `stripeSecretKey`, `validarCredenciales()`. .env.example actualizado con `STRIPE_CLIENT_ID` + `STRIPE_SECRET_KEY`. | profesional.controller.js, profesional.routes.js, routes/index.js, ConfigPagosPage.jsx, .env.example | ✅ Completado |
| 09/03/2026 | coordinador+backend+database+frontend | Admin panel Integraciones: Admin.configuracion (JSON), integraciones.service.js, GET/PUT /admin/integraciones, IntegracionesAdminPage.jsx, migración 20240009-add-configuracion-to-admins.js | admin.controller.js, admin.routes.js, models/Admin.js, services/integraciones.service.js, database/migrations/20240009-add-configuracion-to-admins.js, pages/admin/IntegracionesAdminPage.jsx, pages/index.jsx, router/index.jsx, AdminLayout.jsx | ✅ Completado |
| 09/03/2026 | coordinador+backend+frontend+mercadopago | Fix `oauthDisponible` siempre `false` en getEstadoCredencialesPago. Email del profesional guardado en OAuth callback. Endpoint DELETE /pagos-credenciales (desconectarPasarela). UI conectado: email + Reconectar + Desconectar. Fix JSON Sequelize `.changed()`. Renombrada migración 20240008→20240009. mercadopago/SKILL.md reescrito a OAuth-only. | profesional.controller.js, profesional.routes.js, ConfigPagosPage.jsx, admin.controller.js, .github/skills/mercadopago/SKILL.md, migrations/20240009-add-configuracion-to-admins.js | ✅ Completado |
| 10/03/2026 | coordinador+database+frontend | Diagnóstico completo DER + fix bug admin login (sin link a /admin/login), seeders inconsistentes (Admin1234! vs Admin123!), índices faltantes en Pagos/Turnos, setup.sql desincronizado | LoginPage.jsx, seeders/20240001-seed-admin.js, migrations/20240010-add-missing-indexes.js, scripts/setup.sql | ✅ Completado |

---

# Estado del Proyecto

> Última actualización: 09/03/2026 — OAuth MercadoPago + fix toggle WhatsApp.

## Fases de Implementación

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Estructura base y autenticación | ✅ COMPLETADO |
| Fase 2 | Módulo Paciente (6 páginas) | ✅ COMPLETADO |
| Fase 3 | Dashboard y Agenda profesional | ✅ COMPLETADO (Dashboard funcional con API real) |
| Fase 4 | Turnos pendientes y Pacientes | ✅ COMPLETADO |
| Fase 5 | Configuración (recordatorios, pagos, perfil) | ✅ COMPLETADO |
| Fase 6 | Admin SaaS (login, dashboard, gestión) | ✅ COMPLETADO |
| Fase 7 | Pulido, errores, responsive | ✅ COMPLETADO — todas las páginas conectadas a API real |

---

## Inventario real del sistema (al 08/03/2026)

### Estructura de carpetas

```
/
├── frontend/              ← Código React (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── pacientes/       ← 6 páginas módulo paciente
│   │   │   ├── profesional/     ← 10 páginas módulo profesional
│   │   │   └── admin/           ← 3 páginas módulo admin
│   │   ├── layouts/             ← ProfesionalLayout, AdminLayout, PacienteLayout
│   │   ├── components/layout/   ← Sidebar.jsx, TopBar.jsx
│   │   ├── store/               ← useAuthStore.jsx (Zustand + persist)
│   │   └── router/              ← index.jsx (createBrowserRouter)
└── backend/               ← Express + Sequelize + MySQL
    ├── src/
    │   ├── controllers/         ← auth, publico, profesional, admin, webhook
    │   ├── routes/              ← auth, publico, profesional, admin, webhook + index
    │   ├── models/              ← 7 modelos Sequelize (Turno incluye `pendiente_pago`)
    │   ├── services/            ← disponibilidad, turno, recordatorio, referencia, pago, whatsapp, cron
    │   ├── middlewares/         ← auth, errorHandler, validate, rateLimiter, upload
    │   ├── schemas/             ← auth.schema.js
    │   └── config/              ← database, jwt, mailer, whatsapp
    └── database/
        ├── migrations/          ← 20240001-20240010 (20240010: índices faltantes Pagos+Turnos)
        ├── scripts/setup.sql    ← Script SQL completo — sincronizado con migración 20240010
        └── seeders/index.js     ← Datos de prueba (admin: admin@turnosalud.com / Admin123!)
```

---

### FRONTEND — Páginas implementadas

#### Módulo Paciente (`frontend/src/pages/pacientes/`)
| Archivo | Ruta | Estado |
|---------|------|--------|
| `LandingProfesionalPage.jsx` | `/:slug` | ✅ Implementado — conecta a API `/api/publico/:slug` |
| `CalendarioReservaPage.jsx` | `/:slug/reservar` | ✅ Implementado |
| `FormularioReservaPage.jsx` | `/:slug/reservar/formulario` | ✅ Implementado |
| `ConfirmacionPendientePage.jsx` | `/:slug/reservar/pendiente` | ✅ Implementado |
| `TurnoConfirmadoPage.jsx` | `/:slug/reservar/confirmado` | ✅ Implementado |
| `GestionTurnoPage.jsx` | `/:slug/turno/:id` | ✅ Implementado |

#### Módulo Profesional (`frontend/src/pages/profesional/`)
| Archivo | Ruta | Estado |
|---------|------|--------|
| `LoginPage.jsx` | `/profesional/login` | ✅ Implementado — axios + Zustand + JWT |
| `RegistroPage.jsx` | `/profesional/registro` | ✅ Implementado |
| `DashboardProfesionalPage.jsx` | `/profesional/dashboard` | ✅ Implementado — métricas reales desde API |
| `AgendaProfesionalPage.jsx` | `/profesional/agenda` | ✅ Implementado |
| `TurnosPendientesPage.jsx` | `/profesional/turnos-pendientes` | ✅ Implementado |
| `PacientesPage.jsx` | `/profesional/pacientes` | ✅ Implementado |
| `ConfigRecordatoriosPage.jsx` | `/profesional/recordatorios` | ✅ Implementado |
| `ConfigPagosPage.jsx` | `/profesional/pagos-config` | ✅ Implementado |
| `PagosRecibidosPage.jsx` | `/profesional/pagos-recibidos` | ✅ Implementado |
| `PerfilPublicoPage.jsx` | `/profesional/perfil-publico` | ✅ Implementado |

#### Módulo Admin (`frontend/src/pages/admin/`)
| Archivo | Ruta | Estado |
|---------|------|--------|
| `AdminLoginPage.jsx` | `/admin/login` | ✅ Implementado |
| `DashboardAdminPage.jsx` | `/admin/dashboard` | ✅ Implementado |
| `GestionProfesionalesPage.jsx` | `/admin/profesionales` | ✅ Implementado |
| `IntegracionesAdminPage.jsx` | `/admin/integraciones` | ✅ Implementado — configuración OAuth MP + Stripe |

#### Layouts y Componentes
| Archivo | Estado | Notas |
|---------|--------|-------|
| `ProfesionalLayout.jsx` | ✅ | Sidebar 240px + TopBar + Outlet |
| `AdminLayout.jsx` | ✅ | Sidebar violeta 240px + Outlet |
| `PacienteLayout.jsx` | ✅ | Solo `<Outlet />` sin sidebar |
| `Sidebar.jsx` | ✅ | Zustand logout, active state, links completos |
| `TopBar.jsx` | ✅ | Implementado |
| `useAuthStore.jsx` | ✅ | Zustand + persist (localStorage `turnosalud-auth`) |
| `router/index.jsx` | ✅ | createBrowserRouter, 18 rutas + 404 `NotFoundPage` |

---

### BACKEND — API implementada

**URL base:** `http://localhost:3001/api`

#### Autenticación (`/api/auth`)
| Método | Ruta | Estado |
|--------|------|--------|
| POST | `/auth/profesional/login` | ✅ JWT, bcrypt |
| POST | `/auth/profesional/registro` | ✅ Genera slug único automáticamente |
| GET  | `/auth/profesional/me` | ✅ Auth middleware |
| POST | `/auth/admin/login` | ✅ JWT |
| GET  | `/auth/admin/me` | ✅ Auth middleware |

#### Público — sin auth (`/api/publico`)
| Método | Ruta | Estado |
|--------|------|--------|
| GET  | `/publico/:slug` | ✅ Perfil público, excluye passwordHash |
| GET  | `/publico/:slug/horarios?fecha=` | ✅ Slots disponibles |
| POST | `/publico/:slug/reservar` | ✅ Validación Zod — retorna `pagoUrl` si profesional usa MP |
| POST | `/publico/:slug/pago/preferencia` | ✅ Crea preferencia MP — retorna `preferenceId` + `initPoint` |
| POST | `/publico/:slug/pago/verificar` | ✅ Verifica pago por `paymentId` — actualiza turno si approved |
| POST | `/webhooks/mercadopago` | ✅ Webhook MP con validación HMAC — procesa pago async |
| GET  | `/publico/:slug/turno/:id` | ✅ Turno del paciente (datos + profesional) |
| PATCH | `/publico/:slug/turno/:id/cancelar` | ✅ Cancela turno del paciente |
| PATCH | `/publico/:slug/turno/:id/reprogramar` | ✅ Reprograma — verifica slot disponible |

#### Profesional — requiere JWT (`/api/profesional`)
| Método | Ruta | Estado |
|--------|------|--------|
| GET  | `/profesional/turnos` | ✅ Filtros: fecha, estado, paginación |
| POST | `/profesional/turnos` | ✅ Turno manual |
| GET  | `/profesional/turnos/:id` | ✅ |
| PATCH | `/profesional/turnos/:id/confirmar` | ✅ |
| PATCH | `/profesional/turnos/:id/rechazar` | ✅ Requiere motivo |
| GET  | `/profesional/pacientes` | ✅ |
| GET  | `/profesional/pacientes/:id` | ✅ |
| GET  | `/profesional/perfil` | ✅ |
| PUT  | `/profesional/perfil` | ✅ |
| GET  | `/profesional/dashboard/metricas` | ✅ |
| GET  | `/profesional/recordatorios/config` | ✅ |
| PUT  | `/profesional/recordatorios/config` | ✅ |
| POST | `/profesional/recordatorios/prueba` | ✅ |
| GET  | `/profesional/pagos` | ✅ |
| POST | `/profesional/pacientes` | ✅ |
| POST | `/profesional/pacientes/:id/mensaje` | ✅ Envía email al paciente |
| GET  | `/profesional/pagos-config` | ✅ |
| PUT  | `/profesional/pagos-config` | ✅ |
| GET  | `/profesional/pagos-credenciales` | ✅ Retorna status conexión + pasarela + oauthDisponible + mpEmail |
| POST | `/profesional/pagos-credenciales` | ✅ Guarda credenciales (Stripe) |
| DELETE | `/profesional/pagos-credenciales` | ✅ Desconecta pasarela (borra pagoCredenciales + pasarelaPago) |
| GET  | `/profesional/pagos-credenciales/mp-oauth-url` | ✅ Genera URL de autorización OAuth MP (JWT state) |
| GET  | `/profesional/pagos-credenciales/stripe-oauth-url` | ✅ Genera URL de autorización Stripe Connect (JWT state) |
| GET  | `/mp/oauth/callback` | ✅ Callback público — intercambia code→token+email, guarda, redirige al frontend |
| GET  | `/stripe/oauth/callback` | ✅ Callback público — intercambia code→token Stripe Connect, guarda, redirige |

#### Admin — requiere JWT admin (`/api/admin`)
| Método | Ruta | Estado |
|--------|------|--------|
| GET  | `/admin/profesionales` | ✅ Búsqueda + paginación |
| POST | `/admin/profesionales` | ✅ |
| PUT  | `/admin/profesionales/:id` | ✅ Editar profesional (email/slug únicos, password opcional) |
| PATCH | `/admin/profesionales/:id/estado` | ✅ |
| DELETE | `/admin/profesionales/:id` | ✅ |
| POST | `/admin/profesionales/:id/impersonar` | ✅ |
| GET  | `/admin/dashboard/metricas` | ✅ |
| GET  | `/admin/integraciones` | ✅ Lee MP_CLIENT_ID, MP_CLIENT_SECRET, STRIPE_CLIENT_ID, STRIPE_SECRET_KEY (secrets enmascarados) |
| PUT  | `/admin/integraciones` | ✅ Guarda credenciales OAuth en Admin.configuracion (BD) |

---

### BASE DE DATOS — MySQL 8 (`turnosalud`)

**Tablas creadas y con datos de prueba:**

| Tabla | Registros actuales | Descripción |
|-------|-------------------|-------------|
| `Admins` | 1 | admin@turnosalud.com |
| `Profesionales` | 2 | juan@medico.com, ana@medica.com |
| `ConfiguracionDias` | 14 | 7 días × 2 profesionales |
| `ConfiguracionRecordatorios` | 2 | Config por profesional |
| `Pacientes` | 5 | Distribuidos entre ambos profesionales |
| `Turnos` | 10 | Estados variados |
| `Pagos` | 0 | Sin pagos creados aún |

**Credenciales de prueba:**
- Admin: `admin@turnosalud.com` / `Admin123!`
- Prof 1: `juan@medico.com` / `Medico123!` → slug: `juan-perez`
- Prof 2: `ana@medica.com` / `Medico123!` → slug: `ana-gomez`

---

### PENDIENTES / ISSUES CONOCIDOS

| Issue | Descripción | Prioridad |
|-------|-------------|-----------|
| ~~⚠️ `NotFoundPage` inline~~ | **RESUELTO** — Creada `NotFoundPage.jsx` con diseño real, export actualizado en `pages/index.jsx` | — |
| ~~⚠️ MercadoPago checkout real~~ | **RESUELTO** — `pago.service.js` con Checkout Pro multi-tenant SaaS. Endpoints: `POST /:slug/pago/preferencia` + `POST /:slug/pago/verificar` + Webhook `POST /webhooks/mercadopago` con validación HMAC. Cron jobs de recordatorios y ausencias activos. | — |
| ~~⚠️ WhatsApp recordatorios simulados~~ | **RESUELTO** — Integración Twilio WhatsApp en `whatsapp.service.js`. `recordatorio.service.js` usa ambos canales (email + WhatsApp). Variables de entorno documentadas en `.env.example`. Cron jobs activos. | — |
| ~~⚠️ Botones sin funcionalidad en PacientesPage~~ | **RESUELTO** — Modal "Nuevo turno para este paciente" y modal "Enviar mensaje" completamente implementados | — |
| ~~✅ ~~RESUELTO~~ Ruta `/pagos` faltante~~ | Fix: import + ruta agregada en `profesional.routes.js` | — |
| ~~✅ ~~RESUELTO~~ Mismatch `/recordatorios/config`~~ | Fix: rutas backend actualizadas a `/recordatorios/config` | — |
| ~~⚠️ Botón "Validar credenciales" en ConfigPagosPage~~ | **RESUELTO** — Input controlado + `validarCredenciales()` conectado a `POST /api/profesional/pagos-credenciales` | — |
| ~~⚠️ OAuth MercadoPago — input manual Access Token~~ | **RESUELTO DEFINITIVAMENTE** — El profesional **nunca ve ni escribe un Access Token**. UI muestra siempre el botón "Conectar con MercadoPago" (OAuth 2.0). Si el admin no configuró `MP_CLIENT_ID`/`MP_CLIENT_SECRET`, se muestra mensaje amigable de setup-pendiente. Ver sección **Configuración MercadoPago OAuth** más abajo. | — |
| ~~⚠️ `oauthDisponible` siempre `false`~~ | **RESUELTO** — `getEstadoCredencialesPago` tenía `oauthDisponible: false` hardcodeado. Ahora llama a `getIntegracionesConfig()` y computa: `!!(MP_CLIENT_ID && MP_CLIENT_SECRET)`. También retorna `mpEmail` y `stripeEmail`. | — |
| ~~⚠️ No había panel admin para credenciales~~ | **RESUELTO** — `IntegracionesAdminPage.jsx` en `/admin/integraciones`. Admin puede configurar MP_CLIENT_ID, MP_CLIENT_SECRET, STRIPE_CLIENT_ID, STRIPE_SECRET_KEY vía UI. Se guarda en `Admin.configuracion` (JSON) con migración `20240009`. | — |
| ~~⚠️ UI profesional sin info de cuenta conectada~~ | **RESUELTO** — Estado CONECTADO ahora muestra `Cuenta: email@mp.com` + botones [Reconectar] y [Desconectar]. Email se obtiene de `/users/me` de MP API en el momento del OAuth callback. | — |
| ~~⚠️ Toggle WhatsApp no funciona en ConfigRecordatoriosPage~~ | **RESUELTO** — `handleToggle` se llamaba en el JSX pero nunca estaba definido. Agregada la función `handleToggle(field)` que hace `setConfig(c => ({...c, [field]: !c[field]}))`. | — |
| ~~⚠️ Estado `pendiente_pago` faltante en Turno ENUM~~ | **RESUELTO** — Agregado al modelo Sequelize + migración `20240008`. `crearReserva` ahora detecta si el profesional tiene MP configurado y setea `pendiente_pago`, llama `crearPreferenciaMP` post-commit y retorna `{ pagoUrl, preferenceId }`. El webhook confirma el turno cuando el pago es aprobado. | — |
| ~~⚠️ AGENT.md no se actualizaba al finalizar sesiones~~ | **RESUELTO** — Agregado bloque ⛔ REGLAS DE CIERRE OBLIGATORIO al inicio de AGENT.md con checklist de 5 pasos que el agente debe ejecutar antes de responder "listo". | — |

---

### CONFIGURACIÓN MERCADOPAGO OAUTH — Guía completa

> Aplica solo a profesionales que usan **MercadoPago** como pasarela de pago.

#### 1. Lo que configura el ADMIN DE PLATAFORMA (una sola vez, en `.env`)

```env
# MercadoPago — credenciales de la APP de la plataforma (no del profesional)
MP_CLIENT_ID=          # ID de la app en MP Developers
MP_CLIENT_SECRET=      # Secret de la app en MP Developers

# Redirect URI que debe registrarse en la app de MP Developers:
# → {API_URL}/api/mp/oauth/callback
# Ejemplo: http://localhost:3001/api/mp/oauth/callback

# Stripe Connect — credenciales de la plataforma
STRIPE_CLIENT_ID=      # ID de la app Connect (ca_xxx) en Stripe Dashboard
STRIPE_SECRET_KEY=     # Clave secreta de la plataforma (sk_live_... ó sk_test_...)

# Redirect URI que debe registrarse en Stripe Dashboard → Connect → Settings:
# → {API_URL}/api/stripe/oauth/callback
# Ejemplo: http://localhost:3001/api/stripe/oauth/callback
```

Pasos para obtenerlas:
1. Ir a [https://www.mercadopago.com.ar/developers/panel/app](https://www.mercadopago.com.ar/developers/panel/app)
2. Crear una aplicación (o usar la existente)
3. En **"Credenciales de producción"** copiar `APP_ID` (→ `MP_CLIENT_ID`) y `Client Secret` (→ `MP_CLIENT_SECRET`)
4. En la sección **"Redirect URIs"** de la app, registrar: `{API_URL}/api/mp/oauth/callback`

#### 2. Lo que hace el PROFESIONAL (una sola vez, desde su panel)

**Ruta:** `/profesional/pagos-config`

1. El profesional elige **MercadoPago** como pasarela.
2. Hace clic en el botón azul **"Conectar con MercadoPago"**.
3. Es redirigido a `https://auth.mercadopago.com/authorization?...` — la página de login de MercadoPago.
4. Ingresa su usuario y contraseña de MercadoPago (el profesional solo ve el sitio oficial de MP).
5. MP redirige automáticamente al callback con un `code` temporal.
6. El backend intercambia el `code` por `accessToken` + `refreshToken` y los guarda en `pagoCredenciales` del profesional.
7. El profesional es redirigido a `/profesional/pagos-config?mp_connected=true` — ve "✓ Cuenta conectada".

**El profesional NUNCA ve, anota ni escribe un Access Token.**

#### 3. Flujo técnico end-to-end

```
Profesional              Frontend               Backend                MercadoPago
    │                       │                      │                        │
    │── click "Conectar" ──►│                      │                        │
    │                       │── GET /mp-oauth-url ─►│                        │
    │                       │                      │── genera JWT state      │
    │                       │◄─ { url, ok:true } ──│   encriptado con       │
    │                       │                      │   profesionalId         │
    │◄── redirect to MP ───│                      │                        │
    │                       │                      │                        │
    │── login en MP ─────────────────────────────────────────────────────►│
    │                       │                      │◄── redirect /callback ─│
    │                       │                      │    ?code=XXX&state=JWT  │
    │                       │                      │                        │
    │                       │                      │── verifica JWT state    │
    │                       │                      │── POST /oauth/token ──►│
    │                       │                      │◄── accessToken+refresh─│
    │                       │                      │── guarda en DB          │
    │◄── redirect /pagos-config?mp_connected=true ─│                        │
```

#### 4. Endpoints involucrados

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/profesional/pagos-credenciales` | JWT | Retorna `{ statusConexion, pasarela, oauthDisponible }` |
| GET | `/api/profesional/pagos-credenciales/mp-oauth-url` | JWT | Genera URL de autorización MP con `state` JWT firmado |
| GET | `/api/mp/oauth/callback` | Pública | Recibe `?code&state`, intercambia token, guarda, redirige |

#### 5. Estados posibles en `/profesional/pagos-config` (MP)

| Estado | Condición | UI mostrada |
|--------|-----------|-------------|
| CONECTADO | `statusConexion === 'CONECTADO'` | "✓ Cuenta de MercadoPago conectada" |
| Listo para conectar | `oauthDisponible === true` | Botón azul "Conectar con MercadoPago" |
| Pendiente de admin | `oauthDisponible === false` | Mensaje amigable "La integración está siendo activada..." |

---

### CONFIGURACIÓN STRIPE CONNECT OAUTH — Guía completa

#### 1. Lo que configura el ADMIN DE PLATAFORMA (una sola vez, en `.env`)

```env
STRIPE_CLIENT_ID=     # ca_xxx — Stripe Dashboard → Connect → Overview
STRIPE_SECRET_KEY=    # sk_live_xxx — Stripe Dashboard → Developers → API Keys

# Redirect URI a registrar en Stripe Dashboard → Connect → Settings → Redirect URIs:
# → {API_URL}/api/stripe/oauth/callback
```

#### 2. Lo que hace el PROFESIONAL (una sola vez, desde su panel)

**Ruta:** `/profesional/pagos-config` — seleccionar "Stripe"

1. El profesional elige **Stripe** como pasarela.
2. Hace clic en el botón violeta **"Conectar con Stripe"**.
3. Es redirigido a `https://connect.stripe.com/oauth/authorize?...` — la página de Stripe.
4. Ingresa su usuario y contraseña de Stripe (o crea cuenta nueva).
5. Stripe redirige al callback con un `code` temporal.
6. El backend intercambia el `code` por `access_token` + `stripe_user_id` y los guarda.
7. El profesional ve "✓ Cuenta de Stripe conectada".

**El profesional NUNCA ve `sk_live_...` ni `pk_live_...`.**

#### 3. Flujo técnico end-to-end

```
URL autorización:
https://connect.stripe.com/oauth/authorize
  ?response_type=code
  &client_id=ca_xxx        ← STRIPE_CLIENT_ID
  &scope=read_write
  &state=JWT_FIRMADO       ← contiene profesionalId, expira en 5 min
  &redirect_uri=...

Intercambio de código:
POST https://connect.stripe.com/oauth/token
Authorization: Bearer sk_live_xxx    ← STRIPE_SECRET_KEY
Content-Type: application/x-www-form-urlencoded
Body: grant_type=authorization_code&code=AUTH_CODE

Respuesta: { access_token, stripe_user_id, stripe_publishable_key, refresh_token }
```

#### 4. Endpoints involucrados (Stripe)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/profesional/pagos-credenciales/stripe-oauth-url` | JWT | Genera URL de autorización Stripe con `state` JWT firmado |
| GET | `/api/stripe/oauth/callback` | Pública | Recibe `?code&state`, intercambia token, guarda, redirige |

#### 5. Estados posibles en `/profesional/pagos-config` (Stripe)

| Estado | Condición | UI mostrada |
|--------|-----------|-------------|
| CONECTADO | `statusConexion === 'CONECTADO'` | "✓ Cuenta de Stripe conectada" |
| Listo para conectar | `stripeOauthDisponible === true` | Botón violeta "Conectar con Stripe" |
| Pendiente de admin | `stripeOauthDisponible === false` | Mensaje amigable de setup pendiente |

---

### SCRIPTS DISPONIBLES

```bash
# Backend
cd backend
npm run dev        # Inicia con nodemon (puerto 3001)
npm run seed       # Inserta datos de prueba

# Frontend
cd frontend
npm run dev        # Inicia con Vite (puerto 5173)

# Base de datos
# Ejecutar script SQL (desde PowerShell):
Get-Content backend/database/scripts/setup.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root "-pMatias1234!"
```

# Instrucciones de Trabajo
1. **Lee siempre este archivo antes de empezar** — el estado puede haber cambiado desde la última sesión.
2. Solo trabajaremos en la tarea marcada como "EN PROCESO".
3. No escribas código de otras fases hasta que la actual esté completada y testeada.
4. **AL TERMINAR CUALQUIER TAREA** — ejecutar el checklist de las ⛔ REGLAS DE CIERRE OBLIGATORIO que están al inicio de este archivo. Sin excepción.
5. **El agente que NO actualice AGENT.md ni ejecute la auditoría de skills está incompleto** — la tarea no cuenta como "completada" hasta que el registro esté escrito.
6. Si por límite de tokens no se puede completar el cierre en la misma respuesta, la primera acción de la siguiente respuesta es completar el cierre ANTES de seguir con trabajo nuevo.

# PROMPT AGENTE AI — SISTEMA SAAS DE TURNOS PARA PROFESIONALES DE LA SALUD
## Nivel: Senior Full-Stack React 19 Developer

---

## ROL Y CONTEXTO

Eres un desarrollador Senior Full-Stack especializado en productos SaaS B2B para el sector salud. Tu misión es construir **TurnoSalud**, un sistema de gestión de turnos médicos diseñado para reducir ausencias (no-shows) mediante recordatorios inteligentes, confirmaciones configurables y una experiencia de reserva fluida para el paciente.

**Stack obligatorio:**
- React 19 (cliente, sin Server Components)
- React Router v6 (createBrowserRouter + RouterProvider)
- TailwindCSS v3.4 (con configuración `tailwind.config.js`)
- Shadcn/ui como base de componentes (configurado para Tailwind v3)
- Zustand para estado global
- React Hook Form + Zod para validaciones
- TanStack Query v5 para data fetching
- date-fns para manejo de fechas
- Lucide React para íconos

**Archivos de código:** Todo en `.jsx`. Sin TypeScript. Sin `.tsx`. Sin anotaciones de tipo en el código.

**Configuración Tailwind (`tailwind.config.js`):**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        // Paciente
        paciente: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        // Profesional
        profesional: { DEFAULT: '#10B981', dark: '#059669' },
        // Admin
        admin: { DEFAULT: '#7C3AED', dark: '#6D28D9' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Geist Sans', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

**Principios de diseño:**
- UI limpia, minimalista, estilo SaaS moderno (referencia: Linear, Notion, Cal.com)
- Paleta: blancos, grises neutros, un color primario por módulo
  - Paciente: azul médico (#2563EB)
  - Profesional: slate oscuro (#0F172A) con accent verde (#10B981)
  - Admin SaaS: violeta (#7C3AED)
- Tipografía: Geist Sans (display) + Inter (body)
- Sidebar fijo de 240px en módulo profesional
- Calendario pantalla completa (100vh - header)
- Sin historia clínica, sin egresos, sin facturación avanzada

---

## ARQUITECTURA DE RUTAS — 18 PÁGINAS

```
/                              → Redirect a /admin o /[slug] según contexto
/[slug]                        → PÁGINA 1: Landing personalizada del profesional
/[slug]/reservar               → PÁGINA 2: Calendario pantalla completa
/[slug]/reservar/formulario    → PÁGINA 3: Formulario de reserva
/[slug]/reservar/pendiente     → PÁGINA 4: Confirmación pendiente (modo manual)
/[slug]/reservar/confirmado    → PÁGINA 5: Turno confirmado (modo automático)
/[slug]/turno/:id              → PÁGINA 6: Gestionar mi turno (paciente)

/profesional/login             → PÁGINA 7: Login del profesional
/profesional/dashboard         → PÁGINA 8: Dashboard principal con sidebar
/profesional/agenda            → PÁGINA 9: Agenda editable pantalla completa
/profesional/turnos-pendientes → PÁGINA 10: Turnos pendientes de confirmación
/profesional/pacientes         → PÁGINA 11: Listado de pacientes
/profesional/recordatorios     → PÁGINA 12: Configuración de recordatorios
/profesional/pagos-config      → PÁGINA 13: Configuración de pagos
/profesional/pagos-recibidos   → PÁGINA 14: Pagos recibidos
/profesional/perfil-publico    → PÁGINA 15: Editar perfil público

/admin/login                   → PÁGINA 16: Login Admin SaaS
/admin/dashboard               → PÁGINA 17: Dashboard Admin SaaS
/admin/profesionales           → PÁGINA 18: Gestión de profesionales
```

---

## MÓDULO PACIENTE (PÚBLICO) — Páginas 1 a 6

### PÁGINA 1 — Landing personalizada del profesional
**Ruta:** `/[slug]`
**Descripción:** Página pública que cada profesional personaliza desde su perfil. Es la primera impresión del paciente.

**Layout:**
- Header sticky: logo/nombre del profesional + botón CTA "Reservar turno"
- Hero section: foto de perfil circular (180px), nombre completo, especialidad, descripción corta (max 280 chars)
- Badges de información: ícono + texto para modalidad (presencial/virtual/ambas), obra social (sí/no), duración de turno
- Sección "¿Cómo funciona?": 3 pasos horizontales con íconos (Elegí horario → Completá tus datos → Recibí confirmación)
- Sección días y horarios disponibles: chips de días habilitados (Lun-Mar-Mié…)
- CTA final: botón grande "Ver turnos disponibles →"
- Footer minimalista con datos de contacto opcionales

**Forma del objeto `profesionalPublico`:**
```js
// Ejemplo de estructura de datos esperada de la API
{
  slug: 'dr-garcia',
  nombre: 'Martín',
  apellido: 'García',
  especialidad: 'Médico Clínico',
  descripcion: 'Más de 10 años de experiencia...',
  fotoPerfil: 'https://...',
  modalidad: 'presencial', // 'presencial' | 'virtual' | 'ambas'
  aceptaObrasSociales: true,
  duracionTurno: 30, // minutos
  diasHabilitados: ['lunes', 'martes', 'miercoles'],
  confirmacionAutomatica: false,
  pagoObligatorio: false
}
```

**Comportamiento:**
- Si el slug no existe → 404 con mensaje amigable
- Si el profesional tiene cuenta inactiva → página de "no disponible"
- El botón CTA navega a `/[slug]/reservar`

---

### PÁGINA 2 — Calendario pantalla completa
**Ruta:** `/[slug]/reservar`
**Descripción:** Selector de fecha y horario. Ocupa el 100% de la pantalla. Diseño tipo Cal.com.

**Layout:**
- Header compacto (56px): foto + nombre del profesional + "Seleccioná un turno" + botón volver
- Área principal dividida en dos columnas:
  - **Izquierda (400px fijo):** Calendario mensual interactivo
    - Navegación mes anterior/siguiente
    - Días sin disponibilidad: deshabilitados con color gris
    - Día seleccionado: resaltado con color primario
    - Hoy: marcado con punto
  - **Derecha (flex):** Grilla de horarios disponibles para el día seleccionado
    - Chips de horario: "09:00", "09:30", "10:00"…
    - Chips ocupados: tachados, no clickeables
    - Sin horarios disponibles: mensaje "No hay turnos disponibles para este día"
- Footer fijo (56px): duración del turno + precio si aplica + botón "Confirmar horario →" (se habilita al seleccionar)

**Estado local:**
```jsx
const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)
```

**Queries:**
```jsx
// Obtener disponibilidad del mes
useQuery({ queryKey: ['disponibilidad', slug, mes, año], queryFn: () => fetchDisponibilidad(slug, mes, año) })
// Obtener horarios del día seleccionado
useQuery({ queryKey: ['horarios', slug, fecha], queryFn: () => fetchHorariosDia(slug, fecha), enabled: !!fechaSeleccionada })
```

**Navegación:** Al confirmar → `/[slug]/reservar/formulario?fecha=...&hora=...`

---

### PÁGINA 3 — Formulario de reserva
**Ruta:** `/[slug]/reservar/formulario`
**Descripción:** Captura datos del paciente para completar la reserva.

**Layout:**
- Header: resumen del turno seleccionado (fecha, hora, profesional) en card destacada
- Formulario centrado (max-width: 480px):
  - **Datos personales:**
    - Nombre * (text)
    - Apellido * (text)
    - Teléfono * (tel, formato argentino +54)
    - Email * (email)
    - DNI (number, opcional)
  - **Obra social:**
    - Toggle "¿Tenés obra social?" (visible solo si el profesional las acepta)
    - Si sí: campo select + campo número de afiliado
  - **Motivo de consulta:**
    - Textarea (max 300 chars) — opcional
  - **Pago anticipado:** (visible solo si `pagoObligatorio: true`)
    - Información del monto
    - Botón "Pagar con MercadoPago" o "Pagar con Stripe"
    - Badge "Pago requerido para confirmar el turno"
  - **Checkbox:** "Acepto recibir recordatorios por WhatsApp/email"
  - **Botón:** "Reservar turno →"

**Validación (Zod):**
```jsx
const reservaSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  telefono: z.string().regex(/^\+?54\d{10}$/),
  email: z.string().email(),
  dni: z.string().optional(),
  tieneObraSocial: z.boolean(),
  obraSocial: z.string().optional(),
  numeroAfiliado: z.string().optional(),
  motivoConsulta: z.string().max(300).optional(),
  aceptaRecordatorios: z.boolean()
})
```

**Navegación post-submit:**
- Si `confirmacionAutomatica: true` → `/[slug]/reservar/confirmado`
- Si `confirmacionAutomatica: false` → `/[slug]/reservar/pendiente`

---

### PÁGINA 4 — Confirmación pendiente (revisión manual)
**Ruta:** `/[slug]/reservar/pendiente`
**Descripción:** Pantalla de espera cuando el profesional revisa y confirma manualmente.

**Layout (centrado vertical y horizontal, altura completa):**
- Ícono animado: reloj o sandglass con animación CSS suave
- Título: "Tu solicitud fue recibida"
- Subtítulo: "El/La Dr/a [Nombre] revisará tu solicitud y te confirmará el turno a la brevedad"
- Card de resumen:
  - Fecha y hora solicitada
  - Nombre del paciente
  - Email y teléfono ingresados
- Información de notificación: "Te avisaremos por email y WhatsApp cuando tu turno sea confirmado"
- Botón secundario: "Volver al inicio"
- Número de referencia: `#TRN-XXXXXX` (generado)

**No tiene acciones adicionales.** Es una pantalla informativa de estado.

---

### PÁGINA 5 — Turno confirmado (confirmación automática)
**Ruta:** `/[slug]/reservar/confirmado`
**Descripción:** Pantalla de éxito cuando el turno se confirma automáticamente.

**Layout (centrado):**
- Animación de checkmark verde (CSS o Lottie)
- Título: "¡Turno confirmado!"
- Card principal con todos los detalles:
  - Profesional: foto pequeña + nombre + especialidad
  - Fecha: "Martes 15 de abril de 2025"
  - Hora: "10:30 hs"
  - Modalidad: presencial/virtual + dirección o link
  - Duración: "30 minutos"
- Sección "¿Qué sigue?":
  - ✓ Recibirás un email de confirmación
  - ✓ Te enviaremos recordatorios antes del turno
  - ✓ Podés gestionar tu turno desde el link que te enviamos
- Botones:
  - "Agregar al calendario" (genera .ics)
  - "Gestionar mi turno" → `/[slug]/turno/:id`
- Número de turno: `#TRN-XXXXXX`

---

### PÁGINA 6 — Gestionar mi turno (paciente)
**Ruta:** `/[slug]/turno/:id`
**Descripción:** Panel de autogestión del paciente. Accesible desde el link del email/WhatsApp.

**Layout:**
- Header con logo del profesional
- Card central (max-width: 560px):
  - Badge de estado del turno: `CONFIRMADO` / `PENDIENTE` / `CANCELADO`
  - Detalles completos del turno
  - Datos del paciente (nombre, email, teléfono)

**Acciones disponibles según estado:**
- Estado CONFIRMADO:
  - Botón "Cancelar turno" → abre modal de confirmación con campo motivo (textarea)
  - Botón "Reprogramar" → si el profesional lo permite, abre modal con selector de nueva fecha (mini calendar inline)
  - "Agregar al calendario" (.ics)
- Estado PENDIENTE:
  - Solo "Cancelar solicitud"
- Estado CANCELADO:
  - Información de cancelación + botón "Hacer nueva reserva"

**Modal Cancelar turno:**
```
Título: "¿Cancelar turno?"
Body: Resumen del turno + campo "Motivo (opcional)" textarea
Footer: Botón "Sí, cancelar" (destructivo) | Botón "Volver"
Nota: Si la cancelación es con menos de X horas de anticipación, mostrar aviso
```

**Modal Reprogramar:**
```
Título: "Reprogramar turno"
Body: Mini calendario + selector de horarios
Footer: Botón "Confirmar nueva fecha" | Botón "Cancelar"
```

---

## MÓDULO PROFESIONAL (PRIVADO) — Páginas 7 a 15

### ESTRUCTURA BASE — Layout con Sidebar Fijo

**Componente `ProfesionalLayout`** (envuelve páginas 8-15):
```jsx
// src/layouts/ProfesionalLayout.jsx
export default function ProfesionalLayout() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar fijo 240px */}
      <Sidebar />
      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
```

**Sidebar (240px fijo, altura completa):**
- Header: Logo "TurnoSalud" + nombre del profesional + avatar
- Navegación principal:
  ```
  🏠 Dashboard          /profesional/dashboard
  📅 Agenda             /profesional/agenda
  ⏳ Turnos pendientes  /profesional/turnos-pendientes  [badge con número]
  👥 Pacientes          /profesional/pacientes
  ```
- Sección "Configuración":
  ```
  🔔 Recordatorios      /profesional/recordatorios
  💳 Config. Pagos      /profesional/pagos-config
  💰 Pagos recibidos    /profesional/pagos-recibidos
  🌐 Perfil público     /profesional/perfil-publico
  ```
- Footer del sidebar:
  ```
  ⚙️ Configuración general
  🔗 Ver mi página pública [slug]
  🚪 Cerrar sesión
  ```
- Item activo: background slate-800, texto blanco, borde izquierdo verde accent
- Items inactivos: texto slate-400, hover slate-800

**TopBar (altura 56px):**
- Título de la página actual
- Breadcrumb opcional
- Notificaciones (campana con badge)
- Avatar del profesional

---

### PÁGINA 7 — Login del profesional
**Ruta:** `/profesional/login`
**Descripción:** Pantalla de autenticación. Diseño minimalista, sin sidebar.

**Layout (pantalla dividida):**
- **Lado izquierdo (40%):** Panel con imagen/ilustración, tagline del producto, testimonios opcionales
- **Lado derecho (60%):** Formulario centrado verticalmente:
  - Logo "TurnoSalud"
  - Título: "Bienvenido/a de nuevo"
  - Subtítulo: "Ingresá a tu panel profesional"
  - Campo Email
  - Campo Contraseña + toggle mostrar/ocultar
  - Link "¿Olvidaste tu contraseña?"
  - Botón "Ingresar" (full width)
  - Divisor "¿Sos nuevo?" + Link "Crear cuenta"

**Validación:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
})
```

**Post-login:** Redirect a `/profesional/dashboard`

---

### PÁGINA 8 — Dashboard principal
**Ruta:** `/profesional/dashboard`
**Descripción:** Vista resumen del día y métricas clave. Punto de entrada principal.

**Layout (dentro de ProfesionalLayout):**

**Sección superior — Métricas del día (4 cards en fila):**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Turnos hoy     │ │ Pendientes conf.│ │  Este mes       │ │  Ausencias mes  │
│     8           │ │      3          │ │     47          │ │     5 (10.6%)   │
│  3 confirmados  │ │  Requieren acc. │ │  +12% vs ant.   │ │  -2% vs ant.    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Sección media — Agenda del día (columna principal):**
- Timeline del día (horas de trabajo)
- Cada turno como card:
  - Hora inicio-fin
  - Nombre del paciente
  - Motivo (si lo ingresó)
  - Badge estado: CONFIRMADO / PENDIENTE / CANCELADO
  - Botones rápidos: Confirmar (si pendiente) | Marcar ausente | Ver detalle
- Estado vacío si no hay turnos: ilustración + "No tenés turnos para hoy"

**Sección derecha — Panel de acciones rápidas (sidebar secundario 280px):**
- Próximos turnos pendientes de confirmación (máximo 5)
- Botón "+ Crear turno manual"
- Últimas notificaciones enviadas
- Link a configuración si hay items sin configurar (onboarding)

**Modal — Crear turno manual:**
```
Título: "Nuevo turno manual"
Campos: Buscar paciente (autocomplete) | Fecha | Hora | Modalidad | Notas
Footer: "Guardar turno"
```

---

### PÁGINA 9 — Agenda editable pantalla completa
**Ruta:** `/profesional/agenda`
**Descripción:** Gestión completa de disponibilidad y turnos. Vista calendar a pantalla completa.

**Layout (100% del área de contenido, sin padding):**

**Header de la agenda (56px):**
- Navegador de fechas: `< [Semana del 10-16 abr] >`
- Selector de vista: Día | Semana | Mes
- Botones: "+ Bloquear horario" | "+ Turno manual" | "Configurar horarios"

**Vista Semana (default):**
- Columnas: 7 días
- Filas: horas del día (bloques de 30min)
- Colores de celdas:
  - Verde claro: horario disponible
  - Azul: turno confirmado (con nombre del paciente)
  - Amarillo: turno pendiente
  - Gris: bloqueado / no disponible
  - Rojo: turno cancelado / ausente

**Interacciones en la grilla:**
- Click en celda vacía disponible → abre modal "Bloquear horario" o "Crear turno manual"
- Click en turno existente → abre modal "Detalle del turno"
- Drag and drop de turno → reprogramar (con confirmación)
- Click en "Configurar horarios" → panel lateral deslizable con:
  - Toggle de días habilitados
  - Hora inicio/fin por día
  - Duración del turno (15/20/30/45/60 min)
  - Excepciones (feriados, vacaciones)

**Modal — Detalle del turno (desde agenda):**
```
Título: "Turno - [Nombre Paciente]"
Info: Fecha | Hora | Modalidad | Email | Teléfono | Motivo
Estado actual + historial de cambios de estado
Acciones: [Confirmar] [Reprogramar] [Marcar ausente] [Cancelar]
```

---

### PÁGINA 10 — Turnos pendientes de confirmación
**Ruta:** `/profesional/turnos-pendientes`
**Descripción:** Lista de turnos que esperan confirmación manual. Solo aparece si el profesional tiene `confirmacionAutomatica: false`.

**Layout:**

**Header:**
- Título "Turnos pendientes" + badge con cantidad
- Filtros: Todos | Por fecha | Por obra social
- Botón "Confirmar todos"

**Lista de cards (una por turno):**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Avatar iniciales]  Juan Pérez                              [Confirmar] [✗]  │
│                     juanperez@email.com · +54 11 1234-5678                  │
│                     📅 Miércoles 16 de abril · 14:30 hs · 30 min            │
│                     Motivo: "Consulta de control general"                    │
│                     Solicitado hace 2 horas                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Acciones por card:**
- Botón "Confirmar" → cambia estado, envía notificación al paciente
- Botón "✗ Rechazar" → abre modal con campo motivo del rechazo
- Click en card → abre panel lateral con datos completos

**Panel lateral deslizable (cuando se clickea un turno):**
- Todos los datos del paciente
- Historial de turnos anteriores de ese paciente
- Botones de acción completos

**Estado vacío:** Ilustración + "¡Estás al día! No tenés turnos por confirmar"

---

### PÁGINA 11 — Pacientes
**Ruta:** `/profesional/pacientes`
**Descripción:** Directorio de todos los pacientes que han reservado turnos.

**Layout:**

**Header:**
- Título "Mis Pacientes" + contador total
- Buscador (busca por nombre, email, teléfono, DNI)
- Filtros: Todos | Activos | Con ausencias
- Botón "+ Agregar paciente manual"

**Tabla de pacientes:**
```
Columnas: Paciente | Email | Teléfono | Turnos | Último turno | Ausencias | Acciones
```
- Paginación: 20 por página
- Click en fila → abre panel lateral con detalle del paciente
- Ordenamiento por columnas

**Panel lateral — Detalle del paciente:**
- Datos personales completos
- Obra social (si aplica)
- Estadísticas: total turnos, tasa de asistencia, último turno, próximo turno
- Historial de turnos (lista scrolleable):
  - Cada fila: fecha, hora, estado, motivo
- Botones: "Nuevo turno para este paciente" | "Enviar mensaje"

**Sin historia clínica. Sin notas médicas. Solo datos de gestión de turnos.**

---

### PÁGINA 12 — Configuración de recordatorios
**Ruta:** `/profesional/recordatorios`
**Descripción:** Configuración de cuándo y cómo se envían recordatorios a los pacientes.

**Layout (formulario de configuración):**

**Sección "Canales de notificación":**
- Toggle: Email (siempre activo)
- Toggle: WhatsApp (requiere integración)
- Campo: Número de WhatsApp Business del profesional

**Sección "Cuándo enviar recordatorios":**
- Recordatorio 1: Toggle habilitado + select "48 horas antes / 24 horas antes / 72 horas antes"
- Recordatorio 2: Toggle habilitado + select "2 horas antes / 1 hora antes / 3 horas antes"
- Recordatorio 3 (extra): Toggle + select libre

**Sección "Contenido del recordatorio":**
- Preview del mensaje de email (editable, con variables: {{nombre}}, {{fecha}}, {{hora}}, {{direccion}})
- Preview del mensaje de WhatsApp (editable, más corto)
- Botón "Enviar recordatorio de prueba"

**Sección "Confirmación del turno":**
- Toggle: **"Confirmación automática"**
  - ON: Los turnos se confirman inmediatamente al reservar
  - OFF: Los turnos quedan pendientes hasta que el profesional los confirme manualmente
- Descripción explicativa debajo del toggle

**Sección "Recordatorio de ausencia":**
- Toggle: Enviar notificación al paciente si no se presentó
- Campo: Mensaje de ausencia personalizable

**Footer:** Botón "Guardar configuración"

---

### PÁGINA 13 — Configuración de pagos
**Ruta:** `/profesional/pagos-config`
**Descripción:** Configuración de si se requiere pago y qué pasarela usar.

**Layout:**

**Sección "¿Requerir pago para reservar?":**
- Toggle: **"Pago obligatorio"**
  - ON: El paciente debe pagar para completar la reserva
  - OFF: La reserva es gratuita (pago en consultorio)
- Campo condicional (si ON): Monto del turno (número + selector de moneda ARS/USD)

**Sección "Pasarela de pagos":**
- Cards seleccionables:
  ```
  ┌──────────────────┐  ┌──────────────────┐
  │  MercadoPago     │  │     Stripe       │
  │  [Logo]          │  │  [Logo]          │
  │  Seleccionado ✓  │  │  Conectar        │
  └──────────────────┘  └──────────────────┘
  ```
- Según la selección, muestra formulario de configuración:
  - MercadoPago: campo Access Token + botón "Validar credenciales"
  - Stripe: campo Publishable Key + Secret Key + botón "Validar"
- Badge de estado: CONECTADO / DESCONECTADO

**Sección "Política de reembolsos":**
- Toggle: "¿Aplicar reembolso en cancelaciones?"
- Select: "Con más de 24hs → reembolso total | Con menos de 24hs → sin reembolso"
- Este texto se muestra al paciente en el formulario de reserva

**Sección "Resumen":**
- Tus turnos cuestan: $X ARS
- Pasarela: MercadoPago ✓
- Reembolsos: activados

**Footer:** Botón "Guardar configuración"

---

### PÁGINA 14 — Pagos recibidos
**Ruta:** `/profesional/pagos-recibidos`
**Descripción:** Listado de pagos de turnos recibidos. Sin facturación avanzada.

**Layout:**

**Header con métricas:**
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Este mes        │ │  Pendiente        │ │  Total acumulado │
│  $47.500 ARS     │ │  $6.000 ARS       │ │  $284.000 ARS    │
│  19 pagos        │ │  3 turnos         │ │  desde inicio    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Filtros:**
- Rango de fechas (date picker)
- Estado: Todos | Aprobado | Pendiente | Reembolsado

**Tabla de pagos:**
```
Columnas: Fecha | Paciente | Monto | Pasarela | Estado | Turno | Acciones
```
- Badge coloreado por estado: verde (aprobado), amarillo (pendiente), gris (reembolsado)
- Click en fila → drawer con detalle del pago:
  - ID de transacción
  - Datos completos
  - Botón "Reembolsar" (si aplica por política)

**Exportar:**
- Botón "Exportar CSV" del período filtrado

**Sin facturación, sin AFIP, sin comprobantes.**

---

### PÁGINA 15 — Perfil público editable
**Ruta:** `/profesional/perfil-publico`
**Descripción:** El profesional edita cómo se ve su landing page pública.

**Layout (dos columnas):**
- **Columna izquierda — Editor (50%):**

  **Sección "Identidad":**
  - Upload foto de perfil (drag & drop + preview circular)
  - Nombre y apellido
  - Especialidad (select de lista predefinida + opción "otra")
  - Subtítulo/cargo (ej: "Médico Clínico · MN 12345")
  - Descripción (textarea, max 280 chars con contador)

  **Sección "Contacto y modalidad":**
  - Modalidad: radio buttons (Presencial / Virtual / Ambas)
  - Dirección del consultorio (si presencial)
  - Link de videollamada (si virtual, ej: Google Meet)
  - Toggle: Acepta obras sociales
  - Campo: Qué obras sociales (texto libre)

  **Sección "Configuración del turno":**
  - Duración: select (15 / 20 / 30 / 45 / 60 minutos)
  - Días habilitados: checkboxes (Lun-Mar-Mié-Jue-Vie-Sáb-Dom)
  - Horario de atención por día (hora inicio / hora fin)
  - Tiempo de descanso entre turnos: select (0 / 5 / 10 / 15 min)

  **Sección "URL pública":**
  - Campo: `turnosalud.com/[slug]` (editable, validación de unicidad)
  - Badge: Disponible ✓ / No disponible ✗

- **Columna derecha — Preview (50%):**
  - Preview en tiempo real de cómo se ve la landing
  - Simulación en iframe o componente
  - Botón "Ver página en nueva pestaña"

**Footer:** Botón "Guardar cambios" + "Ver mi página pública →"

---

## MÓDULO ADMIN SAAS — Páginas 16 a 18

### PÁGINA 16 — Login Admin SaaS
**Ruta:** `/admin/login`
**Descripción:** Acceso exclusivo para administradores del producto SaaS.

**Layout:**
- Diseño diferenciado del login profesional (color violeta, fondo oscuro)
- Logo + "Panel de Administración"
- Formulario simple: Email + Contraseña
- Sin opción de registro (acceso solo por invitación)
- Branding discreto: "TurnoSalud Admin v2.0"

---

### PÁGINA 17 — Dashboard Admin SaaS
**Ruta:** `/admin/dashboard`
**Descripción:** Vista general del producto SaaS, métricas globales.

**Layout (con sidebar propio, color violeta):**

**Sidebar admin:**
```
🏠 Dashboard
👨‍⚕️ Profesionales
📊 Métricas globales
💬 Soporte
⚙️ Configuración
```

**Métricas globales (grid de cards):**
```
Total profesionales activos: 234
Turnos creados este mes: 12.847
Tasa de asistencia global: 87.3%
Ingresos del mes (comisiones): $94.200 ARS
Nuevos registros esta semana: 12
Profesionales con plan activo: 198
```

**Gráfico:** Línea temporal de turnos creados por mes (últimos 6 meses)

**Tabla: Últimos profesionales registrados:**
```
Columnas: Nombre | Especialidad | Registro | Turnos mes | Estado plan | Acciones
```

**Alertas del sistema:**
- Profesionales con pagos fallidos
- Integraciones desconectadas
- Errores de envío de recordatorios

---

### PÁGINA 18 — Gestión de profesionales
**Ruta:** `/admin/profesionales`
**Descripción:** CRUD completo de cuentas de profesionales.

**Layout:**

**Header:**
- Título "Profesionales" + contador
- Buscador
- Filtros: Todos | Activos | Inactivos | Plan Básico | Plan Pro
- Botón "+ Crear profesional"

**Tabla completa:**
```
Columnas: Profesional | Email | Especialidad | Plan | Estado | Turnos mes | Registro | Acciones
```
- Click en fila → panel lateral con detalle completo
- Acciones inline: Activar/Desactivar | Editar plan | Impersonar (login como ese profesional para soporte)

**Panel lateral — Detalle del profesional:**
- Todos sus datos
- Plan actual + fecha de vencimiento
- Métricas: turnos totales, tasa de ausencias, pagos procesados
- Configuración actual (qué tiene activado)
- Botones: "Editar datos" | "Cambiar plan" | "Suspender cuenta" | "Eliminar cuenta"

**Modal — Crear/Editar profesional:**
```
Título: "Nuevo profesional" / "Editar profesional"
Tabs: Datos personales | Plan | Acceso
Datos: Nombre | Apellido | Email | Especialidad | Slug | Plan | Password temporal
Footer: "Guardar" | "Cancelar"
```

---

## MODALES GLOBALES (no son páginas)

Definir como componentes separados reutilizables. Nunca combinarlos con páginas:

```jsx
// Modales del módulo paciente
<ModalCancelarTurno />        {/* Confirmación + motivo */}
<ModalReprogramarTurno />     {/* Mini-calendario + selector hora */}

// Modales del módulo profesional
<ModalDetalleTurno />         {/* Desde agenda o dashboard */}
<ModalCrearTurnoManual />     {/* Desde dashboard o agenda */}
<ModalBloquearHorario />      {/* Desde agenda */}
<ModalRechazarTurno />        {/* Desde turnos pendientes */}
<ModalConfirmarAccion />      {/* Genérico: "¿Estás seguro?" */}
<ModalDetallePaciente />      {/* Panel lateral pacientes */}
<ModalDetallePago />          {/* Panel lateral pagos recibidos */}
```

---

## TIPOS Y MODELOS DE DATOS

```jsx
// ============ MODELOS DE DATOS (JSDoc para referencia) ============

/**
 * @typedef {'lunes'|'martes'|'miercoles'|'jueves'|'viernes'|'sabado'|'domingo'} DiaSemana
 * @typedef {'pendiente'|'confirmado'|'cancelado'|'ausente'|'completado'} EstadoTurno
 * @typedef {'presencial'|'virtual'|'ambas'} Modalidad
 * @typedef {'pendiente'|'aprobado'|'rechazado'|'reembolsado'} EstadoPago
 * @typedef {'mercadopago'|'stripe'} PasarelaPago
 */

/**
 * Profesional
 * id, slug, nombre, apellido, email, especialidad, descripcion, fotoPerfil,
 * modalidad, aceptaObrasSociales, duracionTurno, tiempoDescanso,
 * diasHabilitados: ConfiguracionDia[], confirmacionAutomatica, pagoObligatorio,
 * montoPorTurno?, moneda ('ARS'|'USD'), pasarelaPago?, direccion?,
 * linkVideollamada?, obrasSocialesTexto?, createdAt, planActivo
 */

/**
 * ConfiguracionDia
 * dia: DiaSemana, habilitado, horaInicio ("09:00"), horaFin ("18:00")
 */

/**
 * Paciente
 * id, profesionalId, nombre, apellido, email, telefono, dni?,
 * tieneObraSocial, obraSocial?, numeroAfiliado?, aceptaRecordatorios, createdAt
 */

/**
 * Turno
 * id, referencia ("TRN-XXXXXX"), profesionalId, pacienteId, fecha,
 * horaInicio, horaFin, duracion, modalidad, estado,
 * motivoConsulta?, motivoCancelacion?, pagoId?,
 * creadoManualmente, createdAt, updatedAt
 */

/**
 * Pago
 * id, turnoId, profesionalId, pacienteId, monto, moneda,
 * pasarela, estado, transaccionId, createdAt
 */

/**
 * ConfiguracionRecordatorios
 * profesionalId, emailHabilitado, whatsappHabilitado, whatsappNumero?,
 * recordatorio1: { habilitado, horasAntes },
 * recordatorio2: { habilitado, horasAntes },
 * recordatorio3?: { habilitado, horasAntes },
 * mensajeEmail, mensajeWhatsapp, recordatorioAusencia, mensajeAusencia
 */
```

---

## VARIABLES DE ENTORNO NECESARIAS

```env
VITE_API_URL=
VITE_MERCADOPAGO_PUBLIC_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_WHATSAPP_API_URL=
VITE_APP_DOMAIN=turnosalud.com
```

---

## CONVENCIONES Y REGLAS DE CÓDIGO

1. **Componentes:** PascalCase. Un componente = un archivo `.jsx`. Máximo 200 líneas por archivo.
2. **Páginas:** Sufijo `Page` (ej: `DashboardPage.jsx`, `AgendaPage.jsx`).
3. **Hooks:** Prefijo `use`, archivos `.jsx` (ej: `useTurnos.jsx`, `useProfesional.jsx`).
4. **Queries:** Claves como constantes en `/src/constants/queryKeys.js`.
5. **Formularios:** Siempre React Hook Form + Zod. Sin `useState` para inputs de formulario.
6. **Errores:** Toast notifications para errores de API con `react-hot-toast`.
7. **Loading states:** Skeletons de Shadcn/ui, no spinners genéricos.
8. **Fechas:** Siempre `date-fns` con `es` locale. Nunca `new Date().toLocaleDateString()`.
9. **Modales:** Siempre `Dialog` de Shadcn/ui. Nunca markup modal custom.
10. **Sidebar:** Solo en páginas del módulo profesional. Nunca en módulo paciente.
11. **Tailwind v3.4:** Usar clases estándar de v3. NO usar sintaxis de v4 como `bg-(--color)` o utilidades con `/`. Configurar colores custom en `tailwind.config.js` bajo `theme.extend.colors`.
12. **Sin TypeScript:** Cero archivos `.ts` o `.tsx`. Sin anotaciones de tipo en el código. Sin `interface`, `type`, ni generics.

---

## INSTRUCCIONES DE IMPLEMENTACIÓN POR FASES

**Fase 1 — Base y autenticación:**
Configura el proyecto con Vite + React 19 + JSX, React Router v6 (`createBrowserRouter`), Tailwind v3.4 (`tailwind.config.js`), Shadcn/ui, layouts base, login profesional, contexto de autenticación con Zustand.

**Fase 2 — Flujo del paciente:**
Implementa las 6 páginas del módulo paciente en orden: Landing → Calendario → Formulario → Estados finales → Gestionar turno.

**Fase 3 — Dashboard y agenda:**
Dashboard con métricas mock, agenda con calendar view completo, modales de turno.

**Fase 4 — Gestión operativa:**
Turnos pendientes, pacientes, y sus paneles laterales.

**Fase 5 — Configuración:**
Recordatorios, pagos config, pagos recibidos, perfil público editable con preview.

**Fase 6 — Admin SaaS:**
Login admin, dashboard global, gestión de profesionales.

**Fase 7 — Pulido:**
Animaciones, estados de carga con skeletons, manejo de errores, responsive mobile para módulo paciente.

---

## RESTRICCIONES EXPLÍCITAS

❌ NO incluir historia clínica  
❌ NO incluir notas de evolución médica  
❌ NO incluir módulo de egresos o cierre de caja  
❌ NO incluir facturación AFIP/electrónica  
❌ NO incluir gestión de inventario o insumos  
❌ NO mezclar funcionalidades de dos páginas distintas en una sola  
❌ NO usar sidebar en el módulo paciente  
❌ NO usar calendarios que no ocupen pantalla completa en la página de reserva  
❌ NO generar texto en inglés en ningún elemento de UI  
❌ NO usar TypeScript, archivos `.ts` o `.tsx`, ni anotaciones de tipo  
❌ NO usar sintaxis de Tailwind v4 (CSS variables como `bg-(--color)`, `@apply` en línea, etc.)  

✅ TODO el texto de UI en español rioplatense (vos, tu, etc.)  
✅ Cada página debe ser una pantalla independiente y completa  
✅ Separar páginas completas de modales (los modales no son páginas)  
✅ El sidebar del profesional debe ser siempre fijo a la izquierda, 240px  
✅ El calendario de reservas ocupa 100% del viewport disponible