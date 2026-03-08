---
name: senior-database-turnosalud
description: >
  Agente Senior en Diseño y Desarrollo de Bases de Datos MySQL para TurnoSalud. Activa este skill
  para diseñar o modificar tablas, escribir migraciones SQL, optimizar modelos Sequelize, crear
  seeders, definir relaciones, tipos de datos, constraints, ENUMs, y cualquier tarea que involucre
  la capa de datos del sistema. Especialista en MySQL 8 con Sequelize v6, con foco en integridad
  referencial, naming conventions y rendimiento desde el diseño.
---

# Senior Database — TurnoSalud

## Motor y ORM

- **MySQL 8.0** — Base de datos: `turnosalud`
- **ORM:** Sequelize v6 con `mysql2`
- **Script base:** `backend/database/scripts/setup.sql`
- **Seeders:** `backend/database/seeders/index.js`

## Esquema actual — 7 tablas

```sql
Admins
├── id (PK, AUTO_INCREMENT)
├── email (UNIQUE, NOT NULL)
├── passwordHash (NOT NULL)
└── timestamps

Profesionales
├── id (PK)
├── slug (UNIQUE) ← generado automáticamente
├── nombre, apellido, email (UNIQUE)
├── especialidad, descripcion, fotoPerfil
├── modalidad ENUM('presencial','virtual','ambas')  ← MINÚSCULAS
├── aceptaObrasSociales (BOOLEAN)
├── duracionTurno (INT, minutos)
├── tiempoDescanso (INT, minutos)
├── confirmacionAutomatica (BOOLEAN)
├── pagoObligatorio (BOOLEAN)
├── montoPorTurno (DECIMAL, nullable)
├── moneda ENUM('ARS','USD')
├── pasarelaPago ENUM('mercadopago','stripe', nullable)
├── direccion, linkVideollamada, obrasSocialesTexto (nullable)
├── planActivo (BOOLEAN)
└── timestamps

ConfiguracionDias
├── id (PK)
├── profesionalId (FK → Profesionales)
├── dia ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo')  ← MINÚSCULAS
├── habilitado (BOOLEAN)
├── horaInicio ('09:00')
└── horaFin ('18:00')

ConfiguracionRecordatorios
├── id (PK)
├── profesionalId (FK → Profesionales, UNIQUE)
├── emailHabilitado (BOOLEAN)
├── whatsappHabilitado (BOOLEAN)
├── whatsappNumero (nullable)
├── recordatorio1Habilitado, recordatorio1HorasAntes
├── recordatorio2Habilitado, recordatorio2HorasAntes
├── recordatorio3Habilitado, recordatorio3HorasAntes
├── mensajeEmail (TEXT)
├── mensajeWhatsapp (TEXT)
├── recordatorioAusencia (BOOLEAN)
└── mensajeAusencia (TEXT)

Pacientes
├── id (PK)
├── profesionalId (FK → Profesionales)
├── nombre, apellido, email, telefono
├── dni (nullable)
├── tieneObraSocial (BOOLEAN)
├── obraSocial, numeroAfiliado (nullable)
├── aceptaRecordatorios (BOOLEAN)
└── timestamps

Turnos
├── id (PK)
├── referencia ('TRN-XXXXXX', UNIQUE)
├── profesionalId (FK → Profesionales)
├── pacienteId (FK → Pacientes)
├── fecha (DATE)
├── horaInicio, horaFin (TIME)
├── duracion (INT, minutos)
├── modalidad ENUM('presencial','virtual','ambas')
├── estado ENUM('pendiente','confirmado','cancelado','ausente','completado')
├── motivoConsulta (TEXT, nullable)
├── motivoCancelacion (TEXT, nullable)
├── pagoId (FK → Pagos, nullable)
├── creadoManualmente (BOOLEAN)
└── timestamps

Pagos
├── id (PK)
├── turnoId (FK → Turnos)
├── profesionalId (FK → Profesionales)
├── pacienteId (FK → Pacientes)
├── monto (DECIMAL 10,2)
├── moneda ENUM('ARS','USD')
├── pasarela ENUM('mercadopago','stripe')
├── estado ENUM('pendiente','aprobado','rechazado','reembolsado')
├── transaccionId (VARCHAR, nullable) ← ID de MP/Stripe
└── timestamps
```

## Convenciones obligatorias

- **ENUMs siempre en minúsculas** — 'lunes' NO 'Lunes', 'presencial' NO 'Presencial'
- **Nombres de tabla:** PascalCase singular (Profesional, Turno, Pago)
- **FKs:** `modeloId` (profesionalId, pacienteId, turnoId)
- **Fechas:** `createdAt`, `updatedAt` con Sequelize timestamps: true
- **Timestamps Sequelize:** siempre activados en todos los modelos

## Patrón de modelo Sequelize

```js
// models/Turno.js
import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Turno = sequelize.define('Turno', {
  referencia: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente','confirmado','cancelado','ausente','completado'),
    defaultValue: 'pendiente'
  }
  // ...
}, {
  tableName: 'Turnos',
  timestamps: true
})

export default Turno
```

## Issues críticos de BD activos

```
🔴 Seeder inserta 'Lunes' con mayúscula → ENUM espera 'lunes'
🔴 auth.controller envía 'Presencial' → ENUM espera 'presencial'
```

## Reglas críticas

- ❌ NO usar `sync({ force: true })` en producción
- ❌ NO almacenar passwords en texto plano
- ✅ Siempre usar transacciones para inserciones multi-tabla
- ✅ Índices en columnas de búsqueda frecuente: slug, email, profesionalId, fecha
- ✅ `allowNull: false` en campos requeridos
- ✅ Validar ENUMs en capa de aplicación además de BD
