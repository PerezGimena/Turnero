---
name: senior-mercadopago-turnosalud
description: >
  Agente Senior en MercadoPago para TurnoSalud. Activa este skill para implementar o depurar
  la integración de pagos con MercadoPago: Checkout Pro, preferencias de pago, webhooks de
  notificación, validación de pagos aprobados, reembolsos, y todo el flujo de cobro anticipado
  de turnos. El ÚNICO método de conexión es OAuth 2.0 Authorization Code Flow. NUNCA se piden
  Access Tokens manualmente. Especialista en la API de MercadoPago Argentina.
---

# Senior MercadoPago — TurnoSalud

## Contexto de uso

Los profesionales pueden requerir pago anticipado para confirmar turnos.
- **Pasarela:** MercadoPago (o Stripe, alternativo)
- **Flujo:** Paciente paga al reservar → MP notifica por webhook → sistema confirma turno
- **Credenciales:** 100% via OAuth 2.0. El profesional hace clic en "Conectar con MercadoPago", autoriza en el portal de MP y el sistema guarda el `access_token` de forma transparente.

## Arquitectura de credenciales

```
PLATAFORMA (Admin configura una sola vez):
  Admin.configuracion.MP_CLIENT_ID      ← App ID de la app MP de la plataforma
  Admin.configuracion.MP_CLIENT_SECRET  ← Secret de la app MP de la plataforma
  (fallback: process.env.MP_CLIENT_ID / MP_CLIENT_SECRET)

POR PROFESIONAL (via OAuth, nunca manual):
  Profesional.pagoCredenciales = JSON:
    {
      mercadopago: {
        accessToken: "APP_USR-...",   ← token del profesional (secreto, solo backend)
        refreshToken: "TG-...",       ← para renovar el token
        mpUserId: 123456789,          ← ID numérico en MP
        email: "prof@email.com"       ← email de la cuenta MP del profesional
      }
    }
  Profesional.pasarelaPago = 'mercadopago'
```

**Lectura de credenciales de plataforma:** usar siempre `getIntegracionesConfig()` de `integraciones.service.js`.
**Lectura de credenciales de profesional:** leer `Profesional.pagoCredenciales` desde BD.

## OAuth 2.0 — Flujo de conexión del profesional

```
1. Profesional → GET /api/profesional/pagos-credenciales/mp-oauth-url
   Backend:
     a. Carga MP_CLIENT_ID con getIntegracionesConfig()
     b. Genera state JWT firmado (contiene profesionalId, expira en 5m)
     c. Retorna URL de autorización de MP

2. Frontend redirige al profesional a:
   https://auth.mercadopago.com/authorization
     ?client_id=APP_ID
     &response_type=code
     &platform_id=mp
     &redirect_uri=API_URL/api/mp/oauth/callback
     &state=JWT_FIRMADO

3. Profesional autoriza en el portal de MercadoPago

4. MP redirige a: API_URL/api/mp/oauth/callback?code=AUTH_CODE&state=JWT

5. Backend (mpOAuthCallback):
   a. Verifica state JWT (extrae profesionalId)
   b. POST https://api.mercadopago.com/oauth/token con:
      { grant_type, client_id, client_secret, code, redirect_uri }
   c. Recibe { access_token, refresh_token, user_id }
   d. GET https://api.mercadopago.com/users/me con access_token → obtiene email
   e. Guarda en Profesional.pagoCredenciales + pasarelaPago='mercadopago'
   f. Redirige a APP_URL/profesional/pagos-config?mp_connected=true

6. Frontend detecta mp_connected=true en URL → actualiza UI
```

## Desconexión del profesional

```
DELETE /api/profesional/pagos-credenciales
→ pone pagoCredenciales=null, pasarelaPago=null en Profesional
→ El profesional puede reconectar haciendo OAuth nuevamente
```

## Estado de conexión — respuesta del API

```javascript
// GET /api/profesional/pagos-credenciales
// Responde:
{
  ok: true,
  data: {
    statusConexion: 'CONECTADO' | 'DESCONECTADO',
    pasarela: 'mercadopago' | 'stripe' | null,
    oauthDisponible: true,     // si MP_CLIENT_ID + MP_CLIENT_SECRET están configurados
    stripeOauthDisponible: false,
    mpEmail: "prof@email.com", // email de la cuenta MP conectada (null si desconectado)
    stripeEmail: null,
  }
}
```

## Flujo de pago completo

```
1. Paciente completa formulario de reserva
2. Frontend: si pagoObligatorio=true → mostrar botón "Pagar con MercadoPago"
3. Backend: POST /api/publico/:slug/crear-preferencia
   → Lee accessToken de Profesional.pagoCredenciales.mercadopago.accessToken
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
// services/pago.service.js  (o publico.controller.js)
const { MercadoPagoConfig, Preference } = require('mercadopago');

const crearPreferencia = async ({ turno, profesional, paciente }) => {
  // Leer access token desde las credenciales OAuth almacenadas
  const credenciales = profesional.pagoCredenciales
    ? (typeof profesional.pagoCredenciales === 'string'
        ? JSON.parse(profesional.pagoCredenciales)
        : profesional.pagoCredenciales)
    : null;

  const accessToken = credenciales?.mercadopago?.accessToken;
  if (!accessToken) throw new Error('Profesional sin cuenta MercadoPago conectada');

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [{
        title: `Turno con ${profesional.nombre} ${profesional.apellido}`,
        unit_price: profesional.montoPorTurno,
        quantity: 1,
        currency_id: profesional.moneda  // 'ARS'
      }],
      payer: { name: paciente.nombre, email: paciente.email },
      back_urls: {
        success: `${process.env.APP_URL}/${profesional.slug}/reservar/confirmado`,
        failure: `${process.env.APP_URL}/${profesional.slug}/reservar/formulario`,
        pending: `${process.env.APP_URL}/${profesional.slug}/reservar/pendiente`
      },
      auto_return: 'approved',
      external_reference: turno.referencia,  // 'TRN-XXXXXX'
      notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`
    }
  });

  return response;
};
```

## Recepción de webhooks

```javascript
// routes/webhook.routes.js
router.post('/mercadopago', async (req, res, next) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment') {
      await pagoService.procesarWebhookMP(data.id);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});
```

```javascript
// services/pago.service.js
const procesarWebhookMP = async (paymentId) => {
  // 1. Buscar pago en BD por transaccionId para idempotencia
  const existente = await Pago.findOne({ where: { transaccionId: paymentId.toString() } });
  if (existente) return; // ya procesado

  // 2. Obtener detalles del pago desde MP API
  const payment = await obtenerPago(paymentId);

  // 3. Buscar turno por external_reference
  const turno = await Turno.findOne({ where: { referencia: payment.external_reference } });

  // 4. Actualizar Pago en BD
  await Pago.create({
    turnoId: turno.id,
    profesionalId: turno.profesionalId,
    pacienteId: turno.pacienteId,
    monto: payment.transaction_amount,
    moneda: 'ARS',
    pasarela: 'mercadopago',
    estado: payment.status === 'approved' ? 'aprobado' : 'pendiente',
    transaccionId: payment.id.toString()
  });

  // 5. Si aprobado → confirmar turno
  if (payment.status === 'approved') {
    await turno.update({ estado: 'confirmado' });
  }
};
```

## Estados de pago MP → estados internos

```
MP 'approved'  → Pago 'aprobado'    → Turno 'confirmado'
MP 'pending'   → Pago 'pendiente'   → Turno 'pendiente'
MP 'rejected'  → Pago 'rechazado'   → Turno 'cancelado'
MP 'refunded'  → Pago 'reembolsado'
```

## UI del profesional — estados de la pasarela

```
oauthDisponible === null       → spinner (cargando)
oauthDisponible === false      → "Integración en configuración — Contactá al admin"
oauthDisponible === true
  + statusConexion === 'DESCONECTADO' → botón "Conectar con MercadoPago"
  + statusConexion === 'CONECTADO'    → "Estado: Conectado | Cuenta: email@mp.com"
                                        [Reconectar] [Desconectar]
```

## Reglas críticas

- ❌ NUNCA pedir Access Token manual al profesional — solo OAuth
- ❌ NUNCA exponer `accessToken` al frontend
- ❌ NUNCA loggear el Access Token en producción
- ✅ Siempre leer credenciales de `Profesional.pagoCredenciales.mercadopago.accessToken`
- ✅ Siempre leer `MP_CLIENT_ID`/`MP_CLIENT_SECRET` via `getIntegracionesConfig()` (no `process.env` directo)
- ✅ Usar `external_reference` para mapear pago → turno
- ✅ Idempotencia: verificar si el pago ya fue procesado antes de crear duplicado
- ✅ Siempre validar la autenticidad del webhook antes de procesar
