---
name: senior-cyberseguridad-turnosalud
description: >
  Agente Senior en Ciberseguridad para TurnoSalud. Activa este skill para revisar autenticación
  JWT, hardening de Express, protección OWASP Top 10, rate limiting, sanitización de inputs,
  validación de webhooks, CORS, headers de seguridad, manejo seguro de credenciales, y cualquier
  aspecto de seguridad del sistema. Especialista en seguridad para aplicaciones SaaS con datos
  sensibles de salud.
---

# Senior Cyberseguridad — TurnoSalud

## Modelo de amenazas

TurnoSalud maneja:
- Datos personales de pacientes (Ley 25.326)
- Credenciales de pasarelas de pago (MP/Stripe access tokens)
- JWTs de sesión de profesionales y admins
- Datos de salud básicos (obra social, motivo de consulta)

## Checklist de seguridad por capa

### Autenticación y autorización
```
✅ bcrypt con salt rounds = 12 para passwords
✅ JWT con expiración (7d recomendado)
✅ JWT_SECRET de al menos 256 bits (32 bytes random)
✅ JWT diferente para profesional y admin (distintos secrets)
✅ Middleware auth verifica token en TODAS las rutas /profesional/* y /admin/*
✅ Verificar que profesionalId en JWT coincida con recurso solicitado
❌ Sin verificación actual de rutas privadas (QA-002 pendiente)
```

### Validación de inputs
```
✅ Zod schemas para todos los endpoints de escritura
✅ Validar tipos, longitudes y formatos
✅ Sanitizar slugs (solo alphanumeric y guiones)
✅ Escapar caracteres especiales en mensajes de email
❌ No confiar solo en validación frontend
```

### Protección Express
```javascript
// Configuración de seguridad recomendada para app.js
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cors from 'cors'

// Headers de seguridad
app.use(helmet())

// CORS restrictivo
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Solo el dominio del frontend
  credentials: true
}))

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100                    // 100 requests por IP
})
app.use('/api', limiter)

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10  // Máximo 10 intentos de login en 15 minutos
})
app.use('/api/auth', authLimiter)
```

### Datos sensibles
```
✅ NUNCA devolver passwordHash en respuestas
✅ Access tokens de MP/Stripe solo en variables de entorno
✅ .env no commitado al repositorio
✅ .env.example con claves pero sin valores
✅ Logs no deben incluir passwords ni tokens
```

### SQL Injection
```
✅ Sequelize ORM previene SQL injection por default
✅ Usar Sequelize Op para queries dinámicas (nunca string interpolation)
✅ Validar y sanitizar parámetros de búsqueda

// ❌ Vulnerable
const [rows] = await db.query(`SELECT * FROM Profesionales WHERE slug = '${req.params.slug}'`)

// ✅ Seguro
const profesional = await Profesional.findOne({ where: { slug: req.params.slug } })
```

### OWASP Top 10 — Estado actual

```
A01 Broken Access Control      → ⚠️ PARCIAL (falta ProtectedRoute y verificar ownership)
A02 Cryptographic Failures     → ✅ bcrypt + HTTPS requerido
A03 Injection                  → ✅ Sequelize ORM
A04 Insecure Design            → ⚠️ Revisar flujo de impersonación
A05 Security Misconfiguration  → ⚠️ Helmet y CORS a configurar
A06 Vulnerable Components      → ⚠️ Revisar npm audit periódicamente
A07 Auth Failures              → ⚠️ Rate limiting pendiente
A08 Data Integrity Failures    → ✅ Zod validaciones
A09 Logging Failures           → ⚠️ Logging estructurado pendiente
A10 SSRF                       → ✅ No hay requests a URLs externas del usuario
```

## Validación de webhooks MercadoPago

```javascript
// Verificar que el webhook viene realmente de MP
export const validarWebhookMP = (req, res, next) => {
  const secret = process.env.MP_WEBHOOK_SECRET
  const signature = req.headers['x-signature']
  // Implementar HMAC-SHA256 validation con el secret de MP
  // ...
  next()
}
```

## Reglas críticas

- ❌ NUNCA loggear passwords, tokens, ni datos de tarjetas
- ❌ NUNCA hardcodear secrets en el código
- ❌ NUNCA confiar en datos del cliente sin validar en backend
- ✅ Verificar que cada profesional solo accede a SUS recursos
- ✅ npm audit en cada deploy
- ✅ HTTPS obligatorio en producción
