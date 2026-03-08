---
name: senior-modularizacion-turnosalud
description: >
  Agente Senior en Modularización de Sistemas para TurnoSalud. Activa este skill para definir
  o revisar la separación de responsabilidades, estructura de carpetas, organización de módulos
  frontend y backend, extracción de lógica repetida a hooks o services, crear componentes
  reutilizables, y garantizar que el código sea desacoplado y fácil de mantener. Especialista
  en arquitectura de aplicaciones React + Node.js medianas y grandes.
---

# Senior Modularización — TurnoSalud

## Principios de modularización

1. **Separación de responsabilidades** — cada módulo hace UNA cosa
2. **Bajo acoplamiento** — cambiar un módulo no debe romper otro
3. **Alta cohesión** — lo que va junto, queda junto
4. **Inverso de dependencias** — depender de abstracciones, no implementaciones

## Módulos del sistema

```
TurnoSalud tiene 3 módulos principales:

PACIENTE (público)
└── Sin auth. Flujo: Landing → Reserva → Confirmación → Gestión turno
└── No debe importar nada de módulo profesional o admin

PROFESIONAL (autenticado)
└── JWT profesional. Dashboard + Agenda + Pacientes + Config + Pagos
└── No debe importar nada de módulo admin

ADMIN (autenticado)
└── JWT admin. Dashboard global + Gestión de profesionales
└── Puede conocer estructura de profesional para gestión

Regla: Los módulos no se importan entre sí directamente.
Comunicación solo a través de la API.
```

## Estructura frontend — por módulo y por tipo

```
frontend/src/
├── pages/                    ← VISTAS (solo presentación)
│   ├── pacientes/
│   ├── profesional/
│   └── admin/
├── components/               ← COMPONENTES REUTILIZABLES
│   ├── layout/               ← Sidebar, TopBar, layouts
│   ├── modals/               ← Todos los modales
│   ├── ui/                   ← BadgeEstado, EmptyState, Skeleton custom
│   └── forms/                ← Inputs, selects, date pickers personalizados
├── hooks/                    ← LÓGICA REUTILIZABLE
│   ├── useTurnos.jsx
│   ├── usePacientes.jsx
│   ├── useProfesional.jsx
│   └── useDisponibilidad.jsx
├── services/                 ← LLAMADAS A API
│   ├── turno.service.js
│   ├── profesional.service.js
│   └── pago.service.js
├── store/                    ← ESTADO GLOBAL
│   └── useAuthStore.jsx
└── constants/                ← CONSTANTES
    ├── queryKeys.js
    ├── estados.js
    └── routes.js
```

## Estructura backend — por capa

```
backend/src/
├── routes/          ← ROUTING (solo definición de rutas)
├── controllers/     ← ORQUESTACIÓN (req/res, llamar services)
├── services/        ← LÓGICA DE NEGOCIO (pura, testeable)
├── models/          ← ACCESO A DATOS (Sequelize)
├── middlewares/     ← FUNCIONES TRANSVERSALES (auth, validate, errors)
├── schemas/         ← VALIDACIONES (Zod)
└── config/          ← CONFIGURACIÓN (DB, JWT, email)
```

## Patrones de extracción

### Extraer lógica de negocio a services

```js
// ❌ Lógica en controlador
export const confirmarTurno = async (req, res, next) => {
  const turno = await Turno.findByPk(req.params.id)
  if (turno.estado !== 'pendiente') throw new Error('Solo se pueden confirmar turnos pendientes')
  await turno.update({ estado: 'confirmado' })
  // enviar email...
  // registrar en log...
  res.json({ success: true })
}

// ✅ Lógica en service
export const confirmarTurno = async (req, res, next) => {
  const turno = await turnoService.confirmar(req.params.id)
  res.json({ success: true, data: turno })
}
```

### Extraer hook de datos

```jsx
// ❌ Fetch inline en componente
export default function TurnosPendientesPage() {
  const [turnos, setTurnos] = useState([])
  useEffect(() => {
    axios.get('/api/profesional/turnos?estado=pendiente').then(r => setTurnos(r.data))
  }, [])
  // ...
}

// ✅ Hook separado
export function useTurnosPendientes() {
  return useQuery({
    queryKey: [QUERY_KEYS.TURNOS, 'pendiente'],
    queryFn: () => turnoService.listar({ estado: 'pendiente' })
  })
}
```

## Checklist de modularización

```
□ ¿Cada archivo tiene una sola responsabilidad?
□ ¿La página no contiene lógica de negocio directamente?
□ ¿Los servicios frontend no importan componentes UI?
□ ¿Los controladores backend delegan a services?
□ ¿Los services no conocen req/res?
□ ¿Los componentes UI no hacen fetch directo?
□ ¿Los hooks encapsulan la lógica de datos?
□ ¿Las constantes están centralizadas?
```
