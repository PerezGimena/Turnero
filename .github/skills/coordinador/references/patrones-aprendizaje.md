# Patrones de Aprendizaje del Sistema

Este archivo se actualiza automáticamente con el Protocolo de Aprendizaje Continuo.
Documenta patrones frecuentes, combinaciones de agentes y lecciones aprendidas en el uso real.

## Cómo usar este archivo

- El coordinador lo lee cuando detecta una tarea similar a patrones ya registrados
- Se actualiza cada vez que el Protocolo de Aprendizaje registra algo nuevo
- Sirve como memoria acumulada del sistema

---

## Patrones registrados

### Patrón #001 — Inicialización del sistema de aprendizaje
- **Fecha:** 2025-03-09
- **Tarea que lo disparó:** Creación del Protocolo de Aprendizaje Continuo
- **Patrón:** El coordinador evalúa y mejora skills después de cada tarea completada
- **Skills afectados:** coordinador-turnosalud
- **Lección:** Los sistemas multi-agente mejoran con feedback loops integrados

### Patrón #002 — Escalado SaaS por ventanas temporales
- **Fecha:** 2026-03-16
- **Tarea que lo disparó:** Optimizar performance global de listados y base de datos para alto volumen
- **Patrón:** En sistemas SaaS de turnos, los listados deben traer por defecto datos de ventana corta (hoy a +14 dias) y exponer historico por filtros explicitos, acompanado de indices compuestos por tenant+estado+fecha
- **Skills afectados:** backend, database, db-optimizacion, coordinador-turnosalud
- **Lección:** La mejora de rendimiento sostenible requiere combinacion de modelado (tablas), indices y contrato de API (filtros por defecto), no solo tuning de queries

### Patrón #003 — Migración y ORM deben cerrarse juntos
- **Fecha:** 2026-03-16
- **Tarea que lo disparó:** Crear modelos Sequelize faltantes para tablas nuevas de escalado SaaS
- **Patrón:** Cada migracion que agrega tablas o relaciones debe incluir en el mismo ciclo los modelos Sequelize y asociaciones para evitar brechas entre esquema real y capa de aplicacion
- **Skills afectados:** backend, database, coordinador-turnosalud
- **Lección:** El checklist de cierre debe validar sincronia completa: migracion + modelo + asociaciones + export en models/index

### Patrón #004 — CRUD nuevo siempre con tenant filter estricto
- **Fecha:** 2026-03-16
- **Tarea que lo disparó:** Exponer endpoints CRUD de nuevas entidades SaaS para módulo profesional
- **Patrón:** Toda entidad nueva debe resolver aislamiento por tenant en el servicio (where profesionalId o validación por relación) y no delegarlo al cliente
- **Skills afectados:** backend, database, cyberseguridad, coordinador-turnosalud
- **Lección:** El aislamiento multi-tenant correcto se garantiza en backend aplicando req.user.sub en todas las consultas y validando pertenencia de relaciones cruzadas (turnoId/pacienteId)

---

<!-- Los próximos patrones se agregan automáticamente con este formato:

### Patrón #[N] — [nombre descriptivo]
- **Fecha:** [fecha]
- **Tarea que lo disparó:** [descripción breve]
- **Patrón:** [qué se aprendió]
- **Skills afectados:** [lista]
- **Lección:** [takeaway principal]
-->