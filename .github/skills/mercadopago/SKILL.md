---
name: senior-mercadopago-turnosalud
description: >
  Agente Senior en MercadoPago para TurnoSalud. Activa este skill para implementar o depurar
  la integración de pagos con MercadoPago: Checkout Pro, preferencias de pago, webhooks de
  notificación, validación de pagos aprobados, reembolsos, credenciales de acceso, y todo el
  flujo de cobro anticipado de turnos. Especialista en la API de MercadoPago Argentina.
---

# Senior MercadoPago — TurnoSalud

## Contexto de uso

Los profesionales pueden requerir pago anticipado para confirmar turnos.
- **Pasarela:** MercadoPago (o Stripe, alternativo)
- **Flujo:** Paciente paga al reservar → MP notifica por webhook → sistema confirma turno

## Credenciales por profesional

```
Cada profesional tiene SUS propias credenciales de MP:
- ACCESS_TOKEN (backend, secreto)
- PUBLIC_KEY (frontend, público)

Se guardan en Profesionales:
- pasarelaPago: 'mercadopago'
- (pendiente: tabla de credenciales de pasarelas)
```

## Flujo de pago completo

```
1. Paciente completa formulario de reserva
2. Frontend: si pagoObligatorio=true → mostrar botón "Pagar con MercadoPago"
3. Backend: POST /api/publico/:slug/crear-preferencia
   → Crea preferencia en MP API con monto del turno
   → Retorna { preferenceId, initPoint }
4. Frontend: redirigir a initPoint (Checkout Pro de MP)
5. Paciente completa el pago en MP
6. MP redirige a back_urls según resultado:
   - success → /[slug]/reservar/confirmado?turnoId=X
   - failure → /[slug]/reservar/formulario (mostrar error)
   - pending → /[slug]/reservar/pendiente
7. MP envía webhook a POST /api/webhooks/mercadopago
8. Backend: validar webhook → actualizar Pago → confirmar Turno
```

## Crear preferencia de pago

```javascript
// services/pago.service.js
import { MercadoPagoConfig, Preference } from 'mercadopago'

export const crearPreferencia = async ({ turno, profesional, paciente }) => {
  const client = new MercadoPagoConfig({
    accessToken: profesional.mpAccessToken
  })
  
  const preference = new Preference(client)
  
  const response = await preference.create({
    body: {
      items: [{
        title: `Turno con ${profesional.nombre} ${profesional.apellido}`,
        unit_price: profesional.montoPorTurno,
        quantity: 1,
        currency_id: profesional.moneda  // 'ARS'
      }],
      payer: {
        name: paciente.nombre,
        email: paciente.email
      },
      back_urls: {
        success: `${process.env.APP_URL}/${profesional.slug}/reservar/confirmado`,
        failure: `${process.env.APP_URL}/${profesional.slug}/reservar/formulario`,
        pending: `${process.env.APP_URL}/${profesional.slug}/reservar/pendiente`
      },
      auto_return: 'approved',
      external_reference: turno.referencia,  // 'TRN-XXXXXX'
      notification_url: `${process.env.API_URL}/webhooks/mercadopago`
    }
  })
  
  return response
}
```

## Recepción de webhooks

```javascript
// routes/webhook.routes.js
router.post('/mercadopago', async (req, res, next) => {
  try {
    const { type, data } = req.body
    
    if (type === 'payment') {
      await pagoService.procesarWebhookMP(data.id)
    }
    
    res.status(200).json({ received: true })
  } catch (error) {
    next(error)
  }
})
```

```javascript
// services/pago.service.js
export const procesarWebhookMP = async (paymentId) => {
  // 1. Obtener detalles del pago desde MP API
  const payment = await obtenerPago(paymentId)
  
  // 2. Buscar turno por external_reference
  const turno = await Turno.findOne({ where: { referencia: payment.external_reference } })
  
  // 3. Actualizar Pago en BD
  await Pago.create({
    turnoId: turno.id,
    profesionalId: turno.profesionalId,
    pacienteId: turno.pacienteId,
    monto: payment.transaction_amount,
    moneda: 'ARS',
    pasarela: 'mercadopago',
    estado: payment.status === 'approved' ? 'aprobado' : 'pendiente',
    transaccionId: payment.id.toString()
  })
  
  // 4. Si aprobado → confirmar turno
  if (payment.status === 'approved') {
    await turno.update({ estado: 'confirmado' })
  }
}
```

## Estados de pago MP → estados internos

```
MP 'approved'  → Pago 'aprobado'   → Turno 'confirmado'
MP 'pending'   → Pago 'pendiente'  → Turno 'pendiente'
MP 'rejected'  → Pago 'rechazado'  → Turno 'cancelado'
MP 'refunded'  → Pago 'reembolsado'
```

## Validar credenciales del profesional

```javascript
// Endpoint: POST /api/profesional/validar-credenciales-mp
export const validarCredencialesMP = async (req, res, next) => {
  try {
    const { accessToken } = req.body
    const client = new MercadoPagoConfig({ accessToken })
    // Hacer un request simple a MP para validar
    // Si no lanza error → credenciales válidas
    res.json({ valido: true })
  } catch (error) {
    res.json({ valido: false, mensaje: 'Credenciales inválidas' })
  }
}
```

## Reglas críticas

- ❌ NUNCA loggear el Access Token en producción
- ❌ NUNCA exponer el Access Token al frontend
- ✅ Siempre validar la autenticidad del webhook antes de procesar
- ✅ Usar `external_reference` para mapear pago → turno
- ✅ Idempotencia: verificar si el pago ya fue procesado antes de crear duplicado
