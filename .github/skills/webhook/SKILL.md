---
name: senior-webhook-turnosalud
description: >
  Agente Senior en Webhooks para TurnoSalud. Activa este skill para implementar endpoints
  receptores de webhooks (MercadoPago, Stripe, WhatsApp), validar firmas de seguridad,
  procesar eventos de pago, manejar reintentos, garantizar idempotencia, y emitir webhooks
  salientes hacia sistemas externos. Especialista en integración event-driven con pasarelas
  de pago y servicios de mensajería.
---

# Senior Webhook — TurnoSalud

## Webhooks entrantes (receptores)

### MercadoPago
```
URL: POST /api/webhooks/mercadopago
Eventos relevantes:
  - payment → procesar pago de turno
  
Payload de MP:
{
  "action": "payment.created" | "payment.updated",
  "api_version": "v1",
  "data": { "id": "12345678" },
  "date_created": "2024-03-08T10:00:00Z",
  "id": 1234,
  "live_mode": true,
  "type": "payment",
  "user_id": "123456789"
}
```

### Stripe (futuro)
```
URL: POST /api/webhooks/stripe
Eventos relevantes:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - charge.refunded
```

## Implementación del receptor

```javascript
// routes/webhook.routes.js
import { Router } from 'express'
import { express as rawBody } from 'express'
import * as webhookController from '../controllers/webhook.controller.js'

const router = Router()

// IMPORTANTE: raw body para validar firma
router.post('/mercadopago', 
  express.raw({ type: 'application/json' }),
  webhookController.mercadopago
)

router.post('/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.stripe
)

export default router
```

```javascript
// controllers/webhook.controller.js
export const mercadopago = async (req, res, next) => {
  try {
    // 1. Responder 200 INMEDIATAMENTE (MP reintenta si no recibe respuesta rápida)
    res.status(200).json({ received: true })
    
    // 2. Procesar en background
    const { type, data } = JSON.parse(req.body)
    
    if (type === 'payment') {
      // Verificar idempotencia primero
      const existente = await Pago.findOne({ 
        where: { transaccionId: data.id.toString() }
      })
      if (existente) return  // Ya procesado
      
      await pagoService.procesarWebhookMP(data.id)
    }
  } catch (error) {
    // Loggear pero no fallar — ya respondimos 200
    console.error('Error procesando webhook MP:', error)
  }
}
```

## Validación de firma MercadoPago

```javascript
import crypto from 'crypto'

export const validarFirmaMP = (req, res, next) => {
  const xRequestId = req.headers['x-request-id']
  const xSignature = req.headers['x-signature']
  
  if (!xSignature) {
    return res.status(401).json({ error: 'Firma requerida' })
  }
  
  // Parsear firma: ts=...,v1=...
  const parts = xSignature.split(',')
  const ts = parts.find(p => p.startsWith('ts=')).split('=')[1]
  const hash = parts.find(p => p.startsWith('v1=')).split('=')[1]
  
  const manifest = `id:${req.body.data?.id};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex')
  
  if (hash !== expected) {
    return res.status(401).json({ error: 'Firma inválida' })
  }
  
  next()
}
```

## Garantía de idempotencia

```javascript
// Patrón para evitar procesar el mismo pago dos veces
export const procesarPagoIdempotente = async (transaccionId, datos) => {
  // Buscar si ya existe el pago
  const pagoExistente = await Pago.findOne({
    where: { transaccionId: transaccionId.toString() }
  })
  
  if (pagoExistente) {
    console.log(`Pago ${transaccionId} ya procesado, ignorando duplicado`)
    return pagoExistente
  }
  
  // Procesar y crear en transacción
  return await sequelize.transaction(async (t) => {
    const pago = await Pago.create({ ...datos, transaccionId }, { transaction: t })
    await Turno.update({ estado: 'confirmado' }, {
      where: { id: datos.turnoId },
      transaction: t
    })
    return pago
  })
}
```

## Reglas críticas

- ✅ Responder 200 INMEDIATAMENTE — procesar después
- ✅ Verificar idempotencia SIEMPRE antes de procesar
- ✅ Validar firma del webhook ANTES de procesar
- ✅ Loggear todos los webhooks recibidos (id, tipo, timestamp)
- ❌ NO procesar el webhook dos veces si MP reintenta
- ❌ NO fallar silenciosamente — loggear todos los errores
