---
name: senior-escalabilidad-turnosalud
description: >
  Agente Senior en Sistemas Escalables y Mantenimiento para TurnoSalud. Activa este skill para
  mejorar performance, implementar caching, optimizar queries pesadas, revisar arquitectura para
  crecimiento horizontal, planear mantenimiento preventivo, gestionar versiones de API, y
  preparar el sistema para crecer de 100 a 10.000 profesionales sin rediseño. Especialista en
  escalabilidad de SaaS B2B con Node.js y MySQL.
---

# Senior Escalabilidad — TurnoSalud

## Estado actual del sistema

- ~2 profesionales, ~10 turnos (desarrollo)
- Target: 1.000+ profesionales, 50.000+ turnos/mes
- Arquitectura: Monolito modular (adecuado para la etapa actual)

## Cuellos de botella identificados

### Consultas costosas

```javascript
// ⚠️ Costoso: Sin índices en columnas de filtro
Turno.findAll({
  where: { profesionalId, fecha, estado }  // ← necesita índices compuestos
})

// ⚠️ Costoso: Sin paginación
Turno.findAll({ where: { profesionalId } })  // Puede retornar miles de registros
```

### Soluciones de performance

```javascript
// ✅ Índices (ver db-optimizacion/SKILL.md para detalle)
// Índice compuesto para queries más frecuentes
INDEX idx_turnos_prof_fecha (profesionalId, fecha)
INDEX idx_turnos_prof_estado (profesionalId, estado)

// ✅ Paginación obligatoria en listas
Turno.findAndCountAll({
  where: { profesionalId },
  limit: parseInt(req.query.limit) || 20,
  offset: parseInt(req.query.offset) || 0,
  order: [['fecha', 'DESC']]
})
```

## Estrategia de caché

### Nivel 1 — TanStack Query (frontend)
```javascript
// Cache en frontend, stale time configurable
useQuery({
  queryKey: ['profesional', slug],
  queryFn: () => fetchPerfil(slug),
  staleTime: 5 * 60 * 1000,  // 5 minutos — perfil público no cambia seguido
  gcTime: 30 * 60 * 1000     // 30 minutos en memoria
})

// Disponibilidad de slots — refrescar frecuente
useQuery({
  queryKey: ['horarios', slug, fecha],
  staleTime: 30 * 1000  // 30 segundos — puede cambiar rápido
})
```

### Nivel 2 — Redis (a implementar cuando sea necesario)
```javascript
// Cache de perfiles públicos (muy consultados)
const CACHE_TTL = 5 * 60  // 5 minutos

export const getPerfil = async (slug) => {
  const cached = await redis.get(`perfil:${slug}`)
  if (cached) return JSON.parse(cached)
  
  const perfil = await Profesional.findOne({ where: { slug } })
  await redis.setex(`perfil:${slug}`, CACHE_TTL, JSON.stringify(perfil))
  return perfil
}

// Invalidar caché al actualizar perfil
await redis.del(`perfil:${profesional.slug}`)
```

## Escalabilidad horizontal

```
Cuando TurnoSalud crezca, el orden de escalado es:

1. Optimizar queries + índices (GRATIS, antes de escalar)
2. Redis para caché de perfiles y slots (bajo costo)
3. CDN para assets estáticos del frontend
4. Read replicas para MySQL (queries de lectura al réplica)
5. Load balancer + múltiples instancias de Node.js
   → Requiere: sesiones sin estado (ya OK con JWT) + Redis para sockets
6. Queue system (Bull/BullMQ) para jobs asíncronos (recordatorios, webhooks)
7. Microservicios solo si el equipo y la carga lo justifican
```

## Queue para tareas asíncronas

```javascript
// Cuando el volumen de recordatorios crezca
// Usar BullMQ en lugar de cron sync
import { Queue, Worker } from 'bullmq'

const recordatorioQueue = new Queue('recordatorios')

// Encolar al confirmar turno
await recordatorioQueue.add('enviar', {
  turnoId: turno.id,
  tipo: 'recordatorio1',
  horasAntes: 24
}, {
  delay: (turno.fecha - 24*60*60*1000) - Date.now()
})

// Worker en proceso separado
const worker = new Worker('recordatorios', async (job) => {
  await recordatorioService.enviar(job.data)
})
```

## Mantenimiento preventivo

```
Diario:
□ Revisar logs de errores (errores 500, queries lentas)
□ Verificar que cron jobs de recordatorios corrieron

Semanal:
□ npm audit — vulnerabilidades en dependencias
□ Revisar tabla PENDIENTES en AGENT.md
□ Verificar backup de BD

Mensual:
□ Revisar queries lentas con EXPLAIN
□ ANALYZE TABLE para estadísticas de MySQL
□ Revisar uso de disco y crecimiento de BD
□ Actualizar dependencias (minor versions)
```

## Versioning de API

```
Versión actual: /api/... (sin versión explícita)

Cuando sea necesario introducir breaking changes:
/api/v1/... → versión actual
/api/v2/... → nueva versión

Deprecación: mantener v1 activo 6 meses mínimo después de lanzar v2
```
