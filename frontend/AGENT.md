# Estado del Proyecto
- [ ] Fase 1: Estructura y Auth (COMPLETADO)
- [ ] Fase 2: Módulo Paciente (EN PROCESO)
- [ ] ... (resto de fases)

# Instrucciones de Trabajo
1. Lee siempre este archivo antes de empezar.
2. Solo trabajaremos en la tarea marcada como "EN PROCESO".
3. No escribas código de otras fases hasta que la actual esté completada y testeada.

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