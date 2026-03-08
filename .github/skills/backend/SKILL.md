---
name: senior-backend-turnosalud
description: >
  Agente Senior Backend para TurnoSalud. Activa este skill para todo lo relacionado con el
  servidor Express, controladores, rutas, middlewares, servicios, modelos Sequelize, JWT,
  validaciones Zod en backend, manejo de errores, y lógica de negocio del servidor. Especialista
  en Node.js + Express + Sequelize + MySQL con más de 10 años de experiencia en sistemas B2B SaaS.
---

# Senior Backend — TurnoSalud

## Stack del proyecto

- **Runtime:** Node.js (LTS)
- **Framework:** Express 4.x
- **ORM:** Sequelize v6 + MySQL2
- **Validaciones:** Zod
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Email:** Nodemailer
- **Entorno:** dotenv

## Estructura de carpetas backend

```
backend/src/
├── controllers/     ← auth.controller.js, publico.controller.js, profesional.controller.js, admin.controller.js
├── routes/          ← auth.routes.js, publico.routes.js, profesional.routes.js, admin.routes.js, index.js
├── models/          ← 7 modelos Sequelize
├── services/        ← disponibilidad.service.js, turno.service.js, recordatorio.service.js, referencia.service.js
├── middlewares/     ← auth.middleware.js, errorHandler.middleware.js, validate.middleware.js
├── schemas/         ← auth.schema.js (Zod)
└── config/          ← database.js, jwt.js, mailer.js
```

## Modelos Sequelize (7 tablas)

```js
// Asociaciones obligatorias
Profesional.hasMany(ConfiguracionDias)
Profesional.hasOne(ConfiguracionRecordatorios)
Profesional.hasMany(Pacientes)
Profesional.hasMany(Turnos)
Paciente.hasMany(Turnos)
Turno.hasOne(Pago)
```

## Convenciones de código backend

1. **Controladores:** Solo orquestación — delegar lógica a services
2. **Services:** Lógica de negocio pura, sin req/res
3. **Rutas:** Solo mounting — nunca lógica inline
4. **Errores:** Siempre `next(error)` — nunca `res.status(500).json()` directo
5. **Validación:** Zod schema en `/schemas/`, middleware `validate` aplica el schema
6. **JWT:** Siempre verificar con middleware `auth` en rutas protegidas
7. **Passwords:** bcrypt con salt rounds = 12
8. **Slugs:** Generados en registro — `nombre-apellido` + sufijo único si hay colisión

## Issues conocidos de alta prioridad a resolver

```
🔴 ConfiguracionRecordatorios no importado en admin.controller
   → Importar el modelo y usarlo en createProfesional
   
🔴 Sin protección de rutas privadas (ProtectedRoute)
   → Agregar middleware verifyToken en todas las rutas /profesional/* y /admin/*
   
🔴 modalidad con mayúscula en registro
   → auth.controller envía 'Presencial' → debe ser 'presencial' (ENUM minúscula)
   
🔴 Días habilitados en seed con mayúscula
   → Seeder inserta 'Lunes' → debe ser 'lunes' (ENUM minúscula)
```

## Patrón de controlador estándar

```js
// Siempre async/await con try-catch + next
export const miEndpoint = async (req, res, next) => {
  try {
    const resultado = await miService.ejecutar(req.body)
    res.json({ success: true, data: resultado })
  } catch (error) {
    next(error)
  }
}
```

## Patrón de ruta estándar

```js
import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { miSchema } from '../schemas/mi.schema.js'
import * as controller from '../controllers/mi.controller.js'

const router = Router()
router.get('/', verifyToken, controller.listar)
router.post('/', verifyToken, validate(miSchema), controller.crear)
export default router
```

## Endpoints implementados (referencia rápida)

| Grupo | Base | Auth |
|-------|------|------|
| Auth | `/api/auth` | Mixto |
| Público | `/api/publico` | Sin auth |
| Profesional | `/api/profesional` | JWT profesional |
| Admin | `/api/admin` | JWT admin |

## Reglas críticas

- ❌ NO retornar `passwordHash` en ninguna respuesta pública
- ❌ NO usar `req.query` sin sanitizar
- ✅ Siempre paginar listas con `limit` y `offset`
- ✅ Usar `Op` de Sequelize para búsquedas
- ✅ Transacciones Sequelize para operaciones multi-tabla
- ✅ Variables de entorno nunca hardcodeadas
