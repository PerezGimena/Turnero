---
name: senior-disenio-web-turnosalud
description: >
  Agente Senior en Diseño Web para TurnoSalud. Activa este skill para definir o aplicar sistema
  de diseño, paleta de colores, tipografía, espaciado, layout responsivo, componentes visuales,
  animaciones Tailwind, y cualquier decisión de diseño visual del sistema. Referencia estética:
  Linear, Notion, Cal.com — SaaS moderno minimalista. Especialista en Tailwind CSS v3.4, Shadcn/ui,
  y sistemas de diseño para aplicaciones de salud B2B.
---

# Senior Diseño Web — TurnoSalud

## Filosofía de diseño

Estilo SaaS moderno y minimalista. Referencia: **Linear, Notion, Cal.com**.
- UI limpia, sin decoración innecesaria
- Espaciado generoso, jerarquía tipográfica clara
- Colores funcionales (cada módulo tiene su identidad)
- Mobile-first para módulo paciente

## Sistema de colores

```js
// tailwind.config.js — theme.extend.colors
{
  paciente:    { DEFAULT: '#2563EB', dark: '#1D4ED8' },   // Azul médico — módulo paciente
  profesional: { DEFAULT: '#10B981', dark: '#059669' },   // Verde esmeralda — módulo profesional
  admin:       { DEFAULT: '#7C3AED', dark: '#6D28D9' },   // Violeta — módulo admin
}

// Neutros del sistema
// bg-white, bg-gray-50 (fondo páginas)
// bg-gray-100 (fondo secciones secundarias)
// border-gray-200 (bordes)
// text-gray-900 (texto principal)
// text-gray-500 (texto secundario)
// text-gray-400 (placeholders)
```

## Tipografía

```js
// tailwind.config.js — theme.extend.fontFamily
{
  sans:    ['Inter', 'sans-serif'],       // Cuerpo de texto
  display: ['Geist Sans', 'sans-serif'],  // Títulos y headings
}
```

## Layout por módulo

### Módulo Paciente (público)
```
Sin sidebar. PacienteLayout = solo <Outlet />.
Max-width en formularios: 480px centrado.
Calendario: 100% del viewport disponible (100vh - 56px header).
Header sticky de 56px.
Mobile-first — responsive es obligatorio aquí.
```

### Módulo Profesional
```
Sidebar fijo 240px izquierda, color slate oscuro (#0F172A).
TopBar 64px arriba del contenido.
Contenido: flex-1, con padding p-6.
Cards con shadow-sm, border border-gray-200, rounded-lg.
```

### Módulo Admin
```
Sidebar fijo 240px, fondo violeta (#7C3AED).
Mismo patrón que profesional pero con paleta admin.
```

## Componentes visuales estándar

### Cards de métricas
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <p className="text-sm text-gray-500 font-medium">Turnos este mes</p>
  <p className="text-3xl font-bold text-gray-900 mt-1">247</p>
  <p className="text-sm text-green-600 mt-2">↑ 12% vs mes anterior</p>
</div>
```

### Badges de estado
```jsx
// Colores por estado de turno
pendiente:   'bg-yellow-100 text-yellow-800'
confirmado:  'bg-green-100 text-green-800'
cancelado:   'bg-red-100 text-red-800'
ausente:     'bg-orange-100 text-orange-800'
completado:  'bg-blue-100 text-blue-800'
```

### Botones primarios por módulo
```jsx
// Paciente
<button className="bg-paciente hover:bg-paciente-dark text-white px-6 py-3 rounded-lg font-medium">

// Profesional  
<button className="bg-profesional hover:bg-profesional-dark text-white px-6 py-3 rounded-lg font-medium">

// Admin
<button className="bg-admin hover:bg-admin-dark text-white px-6 py-3 rounded-lg font-medium">
```

## Reglas críticas de diseño

- ❌ NO usar sintaxis Tailwind v4 (`bg-(--color)`, `@apply` inline, etc.)
- ❌ NO usar spinners genéricos — usar Skeletons de Shadcn/ui
- ❌ NO texto en inglés en UI
- ✅ Tailwind v3 — definir colores custom en `tailwind.config.js`
- ✅ Español rioplatense en todos los textos
- ✅ Iconos con Lucide React (tamaño estándar: 16px inline, 20px standalone)
- ✅ Focus states accesibles en formularios
- ✅ Responsive obligatorio en módulo paciente (móvil primero)

## Animaciones disponibles

```
tailwindcss-animate está instalado.
Usar: animate-in, fade-in, slide-in-from-bottom para modales y drawers.
Transiciones suaves: transition-colors duration-150 para hover states.
```
