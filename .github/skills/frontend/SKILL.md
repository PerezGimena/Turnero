---
name: senior-frontend-turnosalud
description: >
  Agente Senior Frontend para TurnoSalud. Activa este skill para todo lo relacionado con React 19,
  páginas JSX, componentes, layouts, Zustand, TanStack Query, React Hook Form, Zod en frontend,
  React Router v6, Shadcn/ui, Tailwind v3.4, Lucide icons, date-fns, y cualquier tarea de
  implementación o corrección en el directorio frontend/. Especialista en aplicaciones SaaS
  modernas con React, sin TypeScript, en español rioplatense.
---

# Senior Frontend — TurnoSalud

## Stack obligatorio

```
React 19 (JSX, sin Server Components)
React Router v6 (createBrowserRouter + RouterProvider)
TailwindCSS v3.4 (tailwind.config.js — NO sintaxis v4)
Shadcn/ui (Dialog, Skeleton, Toast, etc.)
Zustand (estado global + persist)
React Hook Form + Zod (formularios)
TanStack Query v5 (data fetching)
date-fns + locale es (manejo de fechas)
Lucide React (íconos)
axios (cliente HTTP)
react-hot-toast (notificaciones)
```

## Estructura de carpetas frontend

```
frontend/src/
├── pages/
│   ├── pacientes/       ← 6 páginas (LandingProfesional, CalendarioReserva, etc.)
│   ├── profesional/     ← 10 páginas (Login, Dashboard, Agenda, etc.)
│   └── admin/           ← 3 páginas (AdminLogin, DashboardAdmin, GestionProfesionales)
├── layouts/             ← ProfesionalLayout, AdminLayout, PacienteLayout
├── components/layout/   ← Sidebar.jsx, TopBar.jsx
├── components/modals/   ← Todos los modales como componentes separados
├── store/               ← useAuthStore.jsx (Zustand + persist)
├── router/              ← index.jsx (createBrowserRouter, 18+ rutas)
├── hooks/               ← useTurnos.jsx, useProfesional.jsx, etc.
├── constants/           ← queryKeys.js
└── lib/                 ← utils.js, axios.js
```

## Convenciones de código

1. **Componentes:** PascalCase. Un componente = un archivo `.jsx`. Máximo 200 líneas.
2. **Páginas:** Sufijo `Page` (ej: `DashboardPage.jsx`)
3. **Hooks:** Prefijo `use`, archivos `.jsx`
4. **Queries:** Claves en `/src/constants/queryKeys.js`
5. **Formularios:** Siempre React Hook Form + Zod. Sin `useState` para inputs
6. **Errores:** `react-hot-toast` para errores de API
7. **Loading:** Skeletons de Shadcn/ui — nunca spinners genéricos
8. **Fechas:** `date-fns` con locale `es` — nunca `toLocaleDateString()`
9. **Modales:** Solo `Dialog` de Shadcn/ui — nunca markup modal custom
10. **Sin TypeScript:** Cero `.ts`, `.tsx`, ni anotaciones de tipo

## Colores por módulo (tailwind.config.js)

```js
colors: {
  paciente:    { DEFAULT: '#2563EB', dark: '#1D4ED8' },   // Azul médico
  profesional: { DEFAULT: '#10B981', dark: '#059669' },   // Verde
  admin:       { DEFAULT: '#7C3AED', dark: '#6D28D9' },   // Violeta
}
```

## Patrón de página estándar

```jsx
// NombrePage.jsx — siempre default export
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'

export default function NombrePage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MI_KEY],
    queryFn: () => fetch...
  })

  if (isLoading) return <NombreSkeleton />
  
  return (
    <div className="...">
      {/* contenido */}
    </div>
  )
}
```

## Patrón de formulario estándar

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ campo: z.string().min(2) })

export default function MiFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })
  
  const onSubmit = async (data) => { ... }
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

## Auth store (Zustand)

```jsx
// useAuthStore.jsx
// Persiste en localStorage bajo clave 'turnosalud-auth'
// Estado: { profesional, token, isAuthenticated, login, logout }
```

## Issues críticos pendientes frontend

```
🔴 Sin ProtectedRoute → crear componente que verifique token antes de renderizar
🟡 Sidebar no tiene link a /profesional/pagos-recibidos → agregar en Sidebar.jsx
🟡 AdminLayout tiene /admin/metricas y /admin/soporte sin páginas → crear o eliminar links
🟡 Dashboard usa axios directo sin TanStack Query → migrar a useQuery
🟢 NotFoundPage es inline → crear página real en pages/NotFoundPage.jsx
```

## Lista de modales globales (componentes separados)

```jsx
// Módulo paciente
<ModalCancelarTurno />
<ModalReprogramarTurno />

// Módulo profesional  
<ModalDetalleTurno />
<ModalCrearTurnoManual />
<ModalBloquearHorario />
<ModalRechazarTurno />
<ModalConfirmarAccion />
<ModalDetallePaciente />
<ModalDetallePago />
```

## Reglas críticas

- ❌ NO usar sintaxis Tailwind v4 (`bg-(--color)`, `@apply` inline)
- ❌ NO texto en inglés en UI
- ❌ NO sidebar en módulo paciente
- ❌ NO TypeScript, ni `.ts` / `.tsx`
- ✅ Todo texto en español rioplatense
- ✅ Calendario de reservas = 100% del viewport
- ✅ Sidebar profesional fijo 240px a la izquierda
