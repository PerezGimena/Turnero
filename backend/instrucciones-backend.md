# PROMPT AGENTE AI — BACKEND SAAS TURNOSALUD

## Nivel: Senior Backend Developer — Node.js · Express · MySQL

---

## ROL Y CONTEXTO

Sos un desarrollador Senior Backend especializado en APIs REST para productos SaaS B2B en el sector salud. Tu misión es construir el backend completo de **TurnoSalud**, un sistema de gestión de turnos médicos. Este backend debe servir exactamente al frontend ya existente, respetando al 100% los nombres de campos, estructuras de datos y flujos definidos en el contrato de datos.

**Stack obligatorio:**

- Node.js v20+
- Express v4
- MySQL 8+ como base de datos relacional
- Sequelize v6 como ORM (con migraciones y seeders)
- JWT (`jsonwebtoken`) para autenticación stateless
- BCrypt (`bcryptjs`) para hash de contraseñas
- Zod para validación de esquemas en el servidor
- `dotenv` para variables de entorno
- `cors`, `helmet`, `morgan` para middlewares de infraestructura
- `express-rate-limit` para protección de endpoints públicos
- `nodemailer` para envío de emails transaccionales
- `multer` para subida de imágenes de perfil

**Sin TypeScript.** Todo en `.js`. Sin anotaciones de tipo. Sin archivos `.ts`.

---

## ARQUITECTURA DE CARPETAS

```
turnosalud-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Sequelize + conexión MySQL
│   │   ├── jwt.js               # Configuración y helpers de JWT
│   │   └── mailer.js            # Configuración de Nodemailer
│   │
│   ├── models/
│   │   ├── index.js             # Inicialización de Sequelize y asociaciones
│   │   ├── Profesional.js
│   │   ├── ConfiguracionDia.js
│   │   ├── Paciente.js
│   │   ├── Turno.js
│   │   ├── Pago.js
│   │   ├── ConfiguracionRecordatorios.js
│   │   └── Admin.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── profesional.controller.js
│   │   ├── paciente.controller.js
│   │   ├── turno.controller.js
│   │   ├── disponibilidad.controller.js
│   │   ├── pago.controller.js
│   │   ├── recordatorio.controller.js
│   │   └── admin.controller.js
│   │
│   ├── routes/
│   │   ├── index.js             # Router raíz que monta todos los routers
│   │   ├── auth.routes.js
│   │   ├── publico.routes.js    # Rutas del módulo paciente (sin auth)
│   │   ├── profesional.routes.js
│   │   ├── turno.routes.js
│   │   ├── pago.routes.js
│   │   └── admin.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Verificación JWT por rol
│   │   ├── validate.middleware.js # Validación Zod
│   │   ├── rateLimiter.middleware.js
│   │   ├── upload.middleware.js # Multer
│   │   └── errorHandler.middleware.js
│   │
│   ├── services/
│   │   ├── disponibilidad.service.js # Lógica de slots disponibles
│   │   ├── recordatorio.service.js   # Envío de emails/notificaciones
│   │   ├── turno.service.js          # Lógica de negocio de turnos
│   │   └── referencia.service.js     # Generación de código TRN-XXXXXX
│   │
│   ├── schemas/                 # Esquemas Zod para validación
│   │   ├── auth.schema.js
│   │   ├── turno.schema.js
│   │   ├── profesional.schema.js
│   │   └── admin.schema.js
│   │
│   └── app.js                   # Express app (sin listen)
│
├── database/
│   ├── migrations/              # Migraciones Sequelize en orden numérico
│   └── seeders/                 # Datos de prueba para desarrollo
│
├── scripts/
│   └── setup.sql                # Script SQL completo para crear la base de datos
│
├── .env.example
├── .gitignore
├── server.js                    # Entry point (llama a app.js y hace listen)
├── package.json
└── README.md
```

**Reglas de arquitectura:**

- Un controller = un archivo. Máximo 150 líneas por controller.
- Toda lógica de negocio va en `services/`, no en controllers.
- Los controllers solo orquestan: reciben request, llaman al service, devuelven response.
- Los middlewares son funciones puras y reutilizables.
- Nunca hay lógica de negocio en los archivos de rutas.

---

## MODELOS DE DATOS

Respetar **exactamente** los siguientes nombres de campos. No agregar ni renombrar campos sin indicarlo explícitamente.

### `Profesional`

```js
{
  id:                    INTEGER PRIMARY KEY AUTO_INCREMENT,
  slug:                  VARCHAR(100) UNIQUE NOT NULL,
  nombre:                VARCHAR(100) NOT NULL,
  apellido:              VARCHAR(100) NOT NULL,
  email:                 VARCHAR(255) UNIQUE NOT NULL,
  passwordHash:          VARCHAR(255) NOT NULL,
  especialidad:          VARCHAR(150),
  descripcion:           TEXT,               // max 280 chars
  fotoPerfil:            VARCHAR(500),
  modalidad:             ENUM('presencial','virtual','ambas') DEFAULT 'presencial',
  aceptaObrasSociales:   BOOLEAN DEFAULT false,
  obrasSocialesTexto:    TEXT,
  duracionTurno:         INTEGER DEFAULT 30, // minutos
  tiempoDescanso:        INTEGER DEFAULT 0,  // minutos entre turnos
  confirmacionAutomatica: BOOLEAN DEFAULT true,
  pagoObligatorio:       BOOLEAN DEFAULT false,
  montoPorTurno:         DECIMAL(10,2),
  moneda:                ENUM('ARS','USD') DEFAULT 'ARS',
  pasarelaPago:          ENUM('mercadopago','stripe'),
  pagoCredenciales:      TEXT,               // JSON cifrado con credenciales
  direccion:             VARCHAR(500),
  linkVideollamada:      VARCHAR(500),
  planActivo:            BOOLEAN DEFAULT true,
  createdAt:             DATETIME,
  updatedAt:             DATETIME
}
```

### `ConfiguracionDia`

```js
{
  id:           INTEGER PRIMARY KEY AUTO_INCREMENT,
  profesionalId: INTEGER NOT NULL,           // FK -> Profesional
  dia:          ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
  habilitado:   BOOLEAN DEFAULT false,
  horaInicio:   VARCHAR(5),                  // formato "09:00"
  horaFin:      VARCHAR(5),                  // formato "18:00"
  createdAt:    DATETIME,
  updatedAt:    DATETIME
}
```

### `Paciente`

```js
{
  id:                INTEGER PRIMARY KEY AUTO_INCREMENT,
  profesionalId:     INTEGER NOT NULL,       // FK -> Profesional
  nombre:            VARCHAR(100) NOT NULL,
  apellido:          VARCHAR(100) NOT NULL,
  email:             VARCHAR(255) NOT NULL,
  telefono:          VARCHAR(20) NOT NULL,
  dni:               VARCHAR(20),
  tieneObraSocial:   BOOLEAN DEFAULT false,
  obraSocial:        VARCHAR(200),
  numeroAfiliado:    VARCHAR(100),
  aceptaRecordatorios: BOOLEAN DEFAULT true,
  createdAt:         DATETIME,
  updatedAt:         DATETIME
}
```

### `Turno`

```js
{
  id:                INTEGER PRIMARY KEY AUTO_INCREMENT,
  referencia:        VARCHAR(20) UNIQUE NOT NULL,  // formato: TRN-XXXXXX
  profesionalId:     INTEGER NOT NULL,             // FK -> Profesional
  pacienteId:        INTEGER NOT NULL,             // FK -> Paciente
  fecha:             DATE NOT NULL,
  horaInicio:        VARCHAR(5) NOT NULL,          // formato "10:30"
  horaFin:           VARCHAR(5) NOT NULL,
  duracion:          INTEGER NOT NULL,             // minutos
  modalidad:         ENUM('presencial','virtual','ambas') NOT NULL,
  estado:            ENUM('pendiente','confirmado','cancelado','ausente','completado') DEFAULT 'pendiente',
  motivoConsulta:    TEXT,
  motivoCancelacion: TEXT,
  pagoId:            INTEGER,                      // FK -> Pago (nullable)
  creadoManualmente: BOOLEAN DEFAULT false,
  createdAt:         DATETIME,
  updatedAt:         DATETIME
}
```

### `Pago`

```js
{
  id:            INTEGER PRIMARY KEY AUTO_INCREMENT,
  turnoId:       INTEGER NOT NULL,          // FK -> Turno
  profesionalId: INTEGER NOT NULL,          // FK -> Profesional
  pacienteId:    INTEGER NOT NULL,          // FK -> Paciente
  monto:         DECIMAL(10,2) NOT NULL,
  moneda:        ENUM('ARS','USD') DEFAULT 'ARS',
  pasarela:      ENUM('mercadopago','stripe') NOT NULL,
  estado:        ENUM('pendiente','aprobado','rechazado','reembolsado') DEFAULT 'pendiente',
  transaccionId: VARCHAR(255),
  createdAt:     DATETIME,
  updatedAt:     DATETIME
}
```

### `ConfiguracionRecordatorios`

```js
{
  id:                    INTEGER PRIMARY KEY AUTO_INCREMENT,
  profesionalId:         INTEGER UNIQUE NOT NULL,   // FK -> Profesional (1:1)
  emailHabilitado:       BOOLEAN DEFAULT true,
  whatsappHabilitado:    BOOLEAN DEFAULT false,
  whatsappNumero:        VARCHAR(30),
  recordatorio1Habilitado: BOOLEAN DEFAULT true,
  recordatorio1HorasAntes: INTEGER DEFAULT 24,
  recordatorio2Habilitado: BOOLEAN DEFAULT false,
  recordatorio2HorasAntes: INTEGER DEFAULT 2,
  recordatorio3Habilitado: BOOLEAN DEFAULT false,
  recordatorio3HorasAntes: INTEGER,
  mensajeEmail:          TEXT,
  mensajeWhatsapp:       TEXT,
  recordatorioAusencia:  BOOLEAN DEFAULT false,
  mensajeAusencia:       TEXT,
  createdAt:             DATETIME,
  updatedAt:             DATETIME
}
```

### `Admin`

```js
{
  id:           INTEGER PRIMARY KEY AUTO_INCREMENT,
  email:        VARCHAR(255) UNIQUE NOT NULL,
  passwordHash: VARCHAR(255) NOT NULL,
  nombre:       VARCHAR(100),
  createdAt:    DATETIME,
  updatedAt:    DATETIME
}
```

---

## AUTENTICACIÓN Y ROLES

El sistema tiene **tres roles diferenciados**. Cada uno tiene su propio flujo de autenticación y sus propios tokens JWT.

### Estructura del JWT Payload

```js
// Token de Profesional
{ sub: profesionalId, rol: 'profesional', email, slug, iat, exp }

// Token de Admin
{ sub: adminId, rol: 'admin', email, iat, exp }

// Token de Paciente (acceso a turno propio)
{ sub: turnoId, pacienteId, rol: 'paciente', referencia, iat, exp }
```

### Endpoints de Auth

#### POST `/api/auth/profesional/login`

- Valida email + password con Zod
- Busca el Profesional por email
- Compara password con `bcryptjs.compare()`
- Si ok: devuelve JWT con expiración de 7 días + datos del profesional (sin passwordHash)
- Si falla: `401 Unauthorized` con mensaje genérico

#### POST `/api/auth/admin/login`

- Igual al anterior pero busca en tabla `Admin`
- JWT con expiración de 1 día

#### GET `/api/auth/profesional/me`

- Ruta protegida con `authMiddleware('profesional')`
- Devuelve datos del profesional autenticado

#### GET `/api/auth/admin/me`

- Ruta protegida con `authMiddleware('admin')`

#### POST `/api/publico/turno/:referencia/token`

- Genera un JWT de corta duración (24hs) para que el paciente gestione su turno
- No requiere contraseña: usa la referencia del turno como validación

### Middleware de Autenticación

```js
// src/middlewares/auth.middleware.js
// Función de orden superior que recibe el rol esperado
const authMiddleware = (rolRequerido) => (req, res, next) => {
  // 1. Extraer token del header Authorization: Bearer <token>
  // 2. Verificar con jwt.verify()
  // 3. Validar que payload.rol === rolRequerido
  // 4. Adjuntar req.user = payload
  // 5. next() si todo ok, 401/403 si falla
};
```

---

## ENDPOINTS DE LA API

### Módulo Público (Paciente) — Sin autenticación

```
GET    /api/publico/:slug                           → Perfil público del profesional
GET    /api/publico/:slug/disponibilidad?mes=&año=  → Días disponibles del mes
GET    /api/publico/:slug/horarios?fecha=            → Slots horarios del día
POST   /api/publico/:slug/reservar                  → Crear turno + paciente
GET    /api/publico/turno/:referencia                → Ver turno por referencia (con token paciente)
PATCH  /api/publico/turno/:referencia/cancelar      → Cancelar turno (con token paciente)
PATCH  /api/publico/turno/:referencia/reprogramar   → Reprogramar turno (con token paciente)
POST   /api/publico/turno/:referencia/token         → Generar token de paciente
```

**Aplicar `express-rate-limit` agresivo en `POST /api/publico/:slug/reservar`** (máximo 5 requests por IP cada 15 minutos).

### Módulo Profesional — Requiere JWT de profesional

```
// Turnos
GET    /api/profesional/turnos                      → Lista paginada con filtros
GET    /api/profesional/turnos/hoy                  → Turnos del día actual
GET    /api/profesional/turnos/pendientes           → Turnos en estado 'pendiente'
GET    /api/profesional/turnos/:id                  → Detalle de un turno
POST   /api/profesional/turnos                      → Crear turno manual
PATCH  /api/profesional/turnos/:id/confirmar        → Confirmar turno
PATCH  /api/profesional/turnos/:id/rechazar         → Rechazar turno (+ motivo)
PATCH  /api/profesional/turnos/:id/ausente          → Marcar como ausente
PATCH  /api/profesional/turnos/:id/cancelar         → Cancelar turno
PATCH  /api/profesional/turnos/:id/reprogramar      → Reprogramar turno

// Pacientes
GET    /api/profesional/pacientes                   → Lista paginada con búsqueda
GET    /api/profesional/pacientes/:id               → Detalle + historial de turnos
POST   /api/profesional/pacientes                   → Crear paciente manual

// Dashboard
GET    /api/profesional/dashboard/metricas          → Cards de métricas del día y mes

// Configuración
GET    /api/profesional/perfil                      → Obtener perfil + config días
PUT    /api/profesional/perfil                      → Actualizar perfil completo
POST   /api/profesional/perfil/foto                 → Subir foto de perfil (multer)
GET    /api/profesional/recordatorios               → Obtener configuración
PUT    /api/profesional/recordatorios               → Guardar configuración
POST   /api/profesional/recordatorios/prueba        → Enviar recordatorio de prueba
GET    /api/profesional/pagos-config                → Obtener config de pagos
PUT    /api/profesional/pagos-config                → Guardar config de pagos
GET    /api/profesional/pagos                       → Lista de pagos recibidos con filtros
GET    /api/profesional/pagos/metricas              → Métricas de ingresos
```

### Módulo Admin — Requiere JWT de admin

```
GET    /api/admin/dashboard/metricas                → Métricas globales del SaaS
GET    /api/admin/profesionales                     → Lista con filtros y paginación
GET    /api/admin/profesionales/:id                 → Detalle completo
POST   /api/admin/profesionales                     → Crear profesional
PUT    /api/admin/profesionales/:id                 → Editar profesional
PATCH  /api/admin/profesionales/:id/activar         → Activar cuenta
PATCH  /api/admin/profesionales/:id/suspender       → Suspender cuenta
DELETE /api/admin/profesionales/:id                 → Eliminar cuenta
POST   /api/admin/profesionales/:id/impersonar      → Generar token temporal de ese profesional
```

---

## LÓGICA DE NEGOCIO CRÍTICA

### Servicio de Disponibilidad (`disponibilidad.service.js`)

Implementar la función `calcularSlotsDisponibles(profesionalId, fecha)`:

1. Obtener la `ConfiguracionDia` del profesional para el día de la semana correspondiente a `fecha`.
2. Si el día no está habilitado → devolver array vacío.
3. Generar todos los slots posibles entre `horaInicio` y `horaFin` con incrementos de `duracionTurno + tiempoDescanso`.
4. Consultar los turnos existentes en esa fecha que estén en estado `pendiente` o `confirmado`.
5. Filtrar los slots que ya están ocupados.
6. Devolver array de objetos `{ hora: "09:00", disponible: true/false }`.

### Generación de Referencia de Turno (`referencia.service.js`)

Generar un código único con el formato `TRN-XXXXXX` donde X es alfanumérico en mayúsculas. Verificar contra la base de datos antes de persistir para garantizar unicidad.

### Flujo de Reserva (`turno.service.js`)

Implementar `crearReserva(slug, datosReserva)`:

1. Obtener el profesional por `slug`. Si no existe → `404`.
2. Verificar que el slot sigue disponible (race condition: usar transacción de MySQL).
3. Buscar si ya existe un `Paciente` con ese email + profesionalId. Si no existe, crearlo.
4. Crear el `Turno` con estado inicial según `confirmacionAutomatica`:
   - `true` → estado `'confirmado'`
   - `false` → estado `'pendiente'`
5. Generar referencia única `TRN-XXXXXX`.
6. Si `pagoObligatorio: true`, crear un `Pago` en estado `'pendiente'`.
7. Enviar email de confirmación o notificación de pendiente (llamar al `recordatorio.service.js`).
8. Devolver el turno creado con todos sus datos.

Todo el proceso debe estar dentro de una **transacción de Sequelize** (`sequelize.transaction()`).

---

## FORMATO DE RESPUESTAS DE LA API

Todas las respuestas deben seguir esta estructura consistente:

```js
// Éxito
{
  "ok": true,
  "data": { /* payload */ },
  "message": "Turno creado correctamente"  // opcional
}

// Error
{
  "ok": false,
  "error": "TURNO_NO_DISPONIBLE",          // código de error en SNAKE_UPPER_CASE
  "message": "El horario seleccionado ya no está disponible"
}

// Listado paginado
{
  "ok": true,
  "data": [ /* array de items */ ],
  "pagination": {
    "total": 87,
    "pagina": 1,
    "porPagina": 20,
    "totalPaginas": 5
  }
}
```

**Códigos de error estándar a implementar:**

- `SLUG_NO_ENCONTRADO`, `PROFESIONAL_INACTIVO`
- `SLOT_NO_DISPONIBLE`, `TURNO_NO_ENCONTRADO`
- `CREDENCIALES_INVALIDAS`, `TOKEN_INVALIDO`, `TOKEN_EXPIRADO`
- `VALIDACION_FALLIDA` (con campo `detalles: []` de errores Zod)
- `ERROR_INTERNO`

---

## MIDDLEWARES

### `validate.middleware.js`

Recibe un schema Zod y valida `req.body`. Si falla, responde `422` con los errores formateados. Si pasa, llama a `next()`.

```js
const validate = (schema) => (req, res, next) => {
  /* ... */
};
```

### `errorHandler.middleware.js`

Middleware global de manejo de errores (4 argumentos: `err, req, res, next`). Debe:

- Loggear el error en consola (con morgan en desarrollo)
- Diferenciar errores de Sequelize (ej: `SequelizeUniqueConstraintError`)
- Responder siempre con el formato estándar de error
- En producción: no exponer stack traces

### `rateLimiter.middleware.js`

Crear dos instancias:

- `rateLimiterPublico`: 5 requests / 15 min (para endpoints de reserva pública)
- `rateLimiterAuth`: 10 requests / 5 min (para endpoints de login)

---

## SCRIPT SQL PARA MYSQL

Crear el archivo `database/scripts/setup.sql` con el DDL completo:

```sql
-- Debe incluir:
-- 1. CREATE DATABASE IF NOT EXISTS turnosalud
-- 2. USE turnosalud
-- 3. CREATE TABLE para cada modelo (en orden que respete FK)
--    Orden: Admin → Profesional → ConfiguracionDia → Paciente → Turno → Pago → ConfiguracionRecordatorios
-- 4. Índices para búsquedas frecuentes:
--    - Profesional: INDEX en (slug), INDEX en (email)
--    - Turno: INDEX en (profesionalId, fecha), INDEX en (referencia), INDEX en (estado)
--    - Paciente: INDEX en (profesionalId, email)
-- 5. INSERT de datos de prueba:
--    - 1 Admin (email: admin@turnosalud.com, password: Admin1234!)
--    - 2 Profesionales con sus ConfiguracionDia y ConfiguracionRecordatorios
--    - 5 Pacientes de prueba
--    - 10 Turnos en distintos estados
```

---

## MIGRACIONES DE SEQUELIZE

Generar migraciones con nombres numerados:

```
20240001-create-admin.js
20240002-create-profesional.js
20240003-create-configuracion-dia.js
20240004-create-paciente.js
20240005-create-turno.js
20240006-create-pago.js
20240007-create-configuracion-recordatorios.js
```

Cada migración debe tener sus métodos `up` (crear tabla) y `down` (drop table).

---

## VARIABLES DE ENTORNO

Crear `.env.example` con todas las variables necesarias:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=turnosalud
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=tu_secreto_super_largo_aqui
JWT_EXPIRATION_PROFESIONAL=7d
JWT_EXPIRATION_ADMIN=1d
JWT_EXPIRATION_PACIENTE=24h

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=TurnoSalud <noreply@turnosalud.com>

# MercadoPago
MP_ACCESS_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# App
APP_DOMAIN=http://localhost:5173
UPLOAD_DIR=uploads/
```

---

## CONFIGURACIÓN CORS

En `app.js`, configurar CORS para aceptar requests desde el frontend:

```js
app.use(
  cors({
    origin: process.env.APP_DOMAIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

---

## CONVENCIONES Y REGLAS

1. **Sin TypeScript.** Todo en `.js`. Sin interfaces, sin `type`, sin generics.
2. **Async/await** en todos los controllers y services. Sin callbacks.
3. **Try/catch** en todos los controllers. Los errores se pasan con `next(err)` al error handler global.
4. **Nunca exponer** `passwordHash` en ninguna respuesta de la API.
5. **Nunca exponer** `pagoCredenciales` en ninguna respuesta de la API.
6. **Paginación** por defecto: `pagina=1`, `porPagina=20`, máximo `porPagina=100`.
7. **Fechas:** Almacenar en UTC en MySQL. Devolver en ISO 8601.
8. **Slugs:** Solo minúsculas, sin espacios, sin caracteres especiales. Validar con regex `/^[a-z0-9-]+$/`.
9. **Todas las rutas privadas** deben estar protegidas. No debe haber ninguna ruta que devuelva datos de un profesional sin verificar que el JWT corresponde a ese profesional.
10. **Seeds de desarrollo:** Incluir un script `npm run seed` que pobla la base con datos de prueba realistas.
11. **Texto de la API en español:** Los mensajes de error y éxito deben estar en español.

---

## FASES DE IMPLEMENTACIÓN

**Fase 1 — Base del proyecto:**
Setup de Express, conexión a MySQL con Sequelize, variables de entorno, middlewares de infraestructura (cors, helmet, morgan, rate limiter, error handler), estructura de carpetas completa.

**Fase 2 — Modelos y migraciones:**
Todos los modelos Sequelize con sus definiciones, validaciones y asociaciones. Script SQL completo. Migraciones numeradas. Seeders de desarrollo.

**Fase 3 — Autenticación:**
Login de profesional y admin con JWT + bcrypt. Middlewares de auth por rol. Endpoint de token para paciente.

**Fase 4 — Módulo público (paciente):**
Endpoints de perfil público, disponibilidad, horarios del día y creación de reserva con toda la lógica de negocio y transacciones.

**Fase 5 — Módulo profesional:**
Todos los endpoints de turnos, pacientes, dashboard y configuración.

**Fase 6 — Módulo admin:**
Endpoints de gestión global de profesionales y métricas del SaaS.

**Fase 7 — Emails y notificaciones:**
Servicio de recordatorios con Nodemailer, templates de email, lógica de cuándo enviar según configuración del profesional.

---

## RESTRICCIONES EXPLÍCITAS

❌ NO incluir historia clínica, notas médicas ni evoluciones  
❌ NO incluir módulo de facturación AFIP ni comprobantes electrónicos  
❌ NO usar TypeScript ni archivos `.ts`  
❌ NO exponer `passwordHash` ni `pagoCredenciales` en ninguna respuesta  
❌ NO usar callbacks: solo async/await  
❌ NO tener lógica de negocio en archivos de rutas  
❌ NO crear endpoints sin validación Zod  
❌ NO devolver respuestas sin el formato estándar `{ ok, data/error, message }`

✅ Toda respuesta sigue el formato estándar de la API  
✅ Toda ruta privada tiene su middleware de auth correspondiente  
✅ Toda lógica de reserva usa transacciones de MySQL  
✅ El slug es la clave pública del profesional en todas las rutas públicas  
✅ Los nombres de campos coinciden exactamente con el frontend (camelCase)  
✅ Todo texto visible de la API (mensajes, errores) en español
