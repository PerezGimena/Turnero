---
name: senior-db-optimizacion-turnosalud
description: >
  Agente Senior en Filtros, Índices y Normalización de Tablas Relacionales para TurnoSalud.
  Activa este skill para analizar y optimizar queries MySQL lentas, diseñar índices compuestos,
  revisar normalización del esquema, usar EXPLAIN ANALYZE, detectar N+1 queries en Sequelize,
  optimizar JOINs, y garantizar que la base de datos escale con el crecimiento del sistema.
---

# Senior DB Optimización — TurnoSalud

## Análisis de queries críticas

### Query 1 — Turnos por profesional y fecha (más frecuente)
```sql
-- Ejecutada en cada carga de agenda
SELECT * FROM Turnos 
WHERE profesionalId = ? AND fecha = ? 
ORDER BY horaInicio ASC;

-- EXPLAIN → Full scan sin índice
-- Solución:
CREATE INDEX idx_turnos_prof_fecha ON Turnos(profesionalId, fecha);
-- Orden correcto: primero la columna con más selectividad
```

### Query 2 — Turnos pendientes por profesional
```sql
SELECT * FROM Turnos
WHERE profesionalId = ? AND estado = 'pendiente'
ORDER BY fecha ASC, horaInicio ASC;

-- Índice:
CREATE INDEX idx_turnos_prof_estado ON Turnos(profesionalId, estado, fecha);
```

### Query 3 — Disponibilidad de slots (muy frecuente, pública)
```sql
SELECT horaInicio, horaFin FROM Turnos
WHERE profesionalId = ? AND fecha = ? AND estado != 'cancelado';

-- Mismo índice que Query 1 aplica
-- Además, índice en estado si se filtra mucho por él
```

### Query 4 — Búsqueda de pacientes (con LIKE)
```sql
-- ⚠️ LIKE con wildcard al inicio es siempre full scan
SELECT * FROM Pacientes WHERE nombre LIKE '%garcia%';

-- Opción 1: FULLTEXT index para búsqueda de texto
ALTER TABLE Pacientes ADD FULLTEXT INDEX ft_pacientes(nombre, apellido);
SELECT * FROM Pacientes WHERE MATCH(nombre, apellido) AGAINST ('garcia');

-- Opción 2: LIKE solo al final (puede usar índice)
SELECT * FROM Pacientes WHERE nombre LIKE 'garcia%';
```

## Índices recomendados — setup.sql

```sql
-- Agregar al final del setup.sql

-- Turnos (tabla más consultada)
CREATE INDEX idx_turnos_prof_fecha     ON Turnos(profesionalId, fecha);
CREATE INDEX idx_turnos_prof_estado    ON Turnos(profesionalId, estado);
CREATE INDEX idx_turnos_estado_fecha   ON Turnos(estado, fecha);
CREATE UNIQUE INDEX idx_turnos_ref     ON Turnos(referencia);

-- Profesionales
CREATE UNIQUE INDEX idx_prof_slug      ON Profesionales(slug);
CREATE UNIQUE INDEX idx_prof_email     ON Profesionales(email);
CREATE INDEX idx_prof_activo           ON Profesionales(planActivo);

-- Pacientes
CREATE INDEX idx_pac_profesional       ON Pacientes(profesionalId);
CREATE INDEX idx_pac_email             ON Pacientes(profesionalId, email);

-- Pagos
CREATE INDEX idx_pagos_turno           ON Pagos(turnoId);
CREATE INDEX idx_pagos_prof_fecha      ON Pagos(profesionalId, createdAt);
CREATE INDEX idx_pagos_transaccion     ON Pagos(transaccionId);

-- ConfiguracionDias
CREATE INDEX idx_config_dias_prof      ON ConfiguracionDias(profesionalId, dia);
```

## Normalización — estado actual y revisión

```
1NF ✅ — Todas las columnas son atómicas
2NF ✅ — Sin dependencias parciales
3NF ✅ — Sin dependencias transitivas
      ⚠️ Excepción intencional: monto/moneda en Turnos Y Pagos
         (desnormalización deliberada para registro histórico)
```

## Detección de N+1 en Sequelize

```javascript
// ❌ N+1: consulta por cada turno
const turnos = await Turno.findAll({ where: { profesionalId } })
for (const turno of turnos) {
  const paciente = await Paciente.findByPk(turno.pacienteId)  // N queries extra!
}

// ✅ Eager loading con include
const turnos = await Turno.findAll({
  where: { profesionalId },
  include: [{
    model: Paciente,
    attributes: ['nombre', 'apellido', 'email']  // Solo campos necesarios
  }]
})
```

## Checklist de optimización

```
□ ¿Las queries frecuentes tienen índices apropiados?
□ ¿Se usa SELECT * donde solo se necesitan algunos campos?
□ ¿Hay N+1 queries en Sequelize (usar include)?
□ ¿Las listas tienen LIMIT/OFFSET?
□ ¿Los LIKE tienen wildcard solo al final?
□ ¿EXPLAIN muestra "Using index" para queries críticas?
□ ¿Las FKs tienen índices? (MySQL no los crea automáticamente)
```

## Cómo usar EXPLAIN

```sql
EXPLAIN SELECT * FROM Turnos
WHERE profesionalId = 1 AND fecha = '2026-03-08';

-- Columnas clave a revisar:
-- type: 'ref' o 'range' es bueno. 'ALL' es full scan → necesita índice
-- key: nombre del índice usado. NULL = sin índice
-- rows: estimación de filas escaneadas. Menor es mejor
-- Extra: 'Using index' es excelente. 'Using filesort' puede optimizarse
```
