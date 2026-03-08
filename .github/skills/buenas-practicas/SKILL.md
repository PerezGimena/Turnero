---
name: senior-buenas-practicas-turnosalud
description: >
  Agente Senior en Buenas Prácticas de Programación para TurnoSalud. Activa este skill para
  code reviews, refactorizaciones, aplicar principios SOLID, DRY, KISS, detectar code smells,
  revisar naming conventions, estructura de archivos, patrones de diseño, y garantizar que el
  código sea mantenible y legible. Especialista en JavaScript/JSX moderno sin TypeScript.
---

# Senior Buenas Prácticas — TurnoSalud

## Convenciones de nomenclatura

### Archivos
```
PascalCase   → Componentes React: DashboardPage.jsx, Sidebar.jsx
camelCase    → Servicios, hooks, utils: turno.service.js, useTurnos.jsx
kebab-case   → Constantes de rutas, IDs de claves
UPPER_CASE   → Variables de entorno en .env
```

### Variables y funciones
```javascript
// ✅ Nombres descriptivos
const turnosPendientes = []
const calcularDisponibilidad = (fecha, config) => {}
const handleConfirmarTurno = async (id) => {}

// ❌ Nombres genéricos
const data = []
const fn = () => {}
const x = 5
```

## Principios aplicados al proyecto

### DRY (Don't Repeat Yourself)
```jsx
// ❌ Repetir lógica de badge en cada componente
<span className="bg-yellow-100 text-yellow-800">pendiente</span>

// ✅ Componente BadgeEstado reutilizable
const COLORES_ESTADO = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-green-100 text-green-800',
  cancelado:  'bg-red-100 text-red-800',
  ausente:    'bg-orange-100 text-orange-800',
  completado: 'bg-blue-100 text-blue-800'
}

export function BadgeEstado({ estado }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLORES_ESTADO[estado]}`}>{estado}</span>
}
```

### Single Responsibility
```jsx
// ❌ Página que hace todo
export default function TurnosPage() {
  // fetch de datos
  // lógica de filtros
  // manejo de modales
  // renderizado de tabla
  // ... 400 líneas
}

// ✅ Separar en hooks y componentes
export default function TurnosPage() {
  const { turnos, isLoading } = useTurnos()
  const { filtros, setFiltro } = useFiltrosTurnos()
  
  return (
    <div>
      <FiltrosTurnos filtros={filtros} onChange={setFiltro} />
      <TablaTurnos turnos={turnos} isLoading={isLoading} />
    </div>
  )
}
```

## Límites de tamaño

```
Páginas (Page.jsx):     máx 200 líneas
Componentes:            máx 150 líneas
Servicios (service.js): máx 200 líneas
Controladores:          máx 100 líneas (delegar a services)
Hooks (use*.jsx):       máx 100 líneas
```

## Patrones de error handling

```javascript
// Backend — siempre next(error)
export const miController = async (req, res, next) => {
  try {
    const data = await miService.ejecutar(req.body)
    res.json({ success: true, data })
  } catch (error) {
    next(error)  // ← errorHandler middleware lo captura
  }
}

// Frontend — siempre con onError en mutation
const mutation = useMutation({
  mutationFn: confirmarTurno,
  onSuccess: () => toast.success('Turno confirmado'),
  onError: (error) => toast.error(error.response?.data?.message || 'Error al confirmar')
})
```

## Code smells a evitar

```
❌ Magic numbers: usar constantes con nombre
   const SALT_ROUNDS = 12  (no hardcodear 12 inline)

❌ Comentarios que explican qué hace el código (el código debe ser auto-documentado)
   // Sumar 1 al contador  ← innecesario
   contador++

✅ Comentarios que explican el POR QUÉ
   // Delay de 500ms para evitar condición de carrera con el redirect
   await delay(500)

❌ Console.log en producción
❌ Variables no usadas
❌ Imports no usados
❌ TODOs sin ticket asociado
```

## Checklist de code review

```
□ ¿El componente hace solo una cosa?
□ ¿El nombre describe exactamente qué hace?
□ ¿Hay lógica duplicada que podría extraerse?
□ ¿Los errores se manejan correctamente?
□ ¿Las funciones async tienen try/catch o onError?
□ ¿El archivo tiene menos de 200 líneas?
□ ¿Se usan las convenciones del proyecto (date-fns, toast, etc.)?
□ ¿No hay texto en inglés en la UI?
□ ¿No hay TypeScript ni anotaciones de tipo?
□ ¿Tailwind v3 (no v4)?
```
