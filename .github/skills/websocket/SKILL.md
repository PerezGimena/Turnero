---
name: senior-websocket-turnosalud
description: >
  Agente Senior en WebSockets para TurnoSalud. Activa este skill para implementar comunicación
  en tiempo real con Socket.io: notificaciones instantáneas de nuevos turnos, actualizaciones
  de estado en vivo en la agenda del profesional, alertas de cancelación en tiempo real, y
  cualquier feature que requiera comunicación bidireccional sin polling. Especialista en
  Socket.io con Express y React.
---

# Senior WebSocket — TurnoSalud

## Casos de uso en TurnoSalud

1. **Nuevo turno pendiente** → notificar al profesional en tiempo real
2. **Turno cancelado por paciente** → actualizar agenda inmediatamente
3. **Pago confirmado por MP** → actualizar estado del turno en vivo
4. **Dashboard métricas** → contador de turnos del día actualizado en tiempo real

## Arquitectura Socket.io

```javascript
// backend/src/config/socket.js
import { Server } from 'socket.io'

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  })
  
  // Namespaces por módulo
  const profesionalNS = io.of('/profesional')
  
  profesionalNS.use(authSocketMiddleware)  // Verificar JWT
  
  profesionalNS.on('connection', (socket) => {
    const profesionalId = socket.user.id
    
    // Sala privada por profesional
    socket.join(`profesional:${profesionalId}`)
    
    socket.on('disconnect', () => {
      // cleanup
    })
  })
  
  return io
}
```

## Integración en app.js

```javascript
// backend/src/app.js
import { createServer } from 'http'
import { initSocket } from './config/socket.js'

const app = express()
const httpServer = createServer(app)
const io = initSocket(httpServer)

// Hacer io disponible en controladores
app.set('io', io)

// Usar httpServer en lugar de app para escuchar
httpServer.listen(PORT)
```

## Emitir eventos desde controladores

```javascript
// controllers/profesional.controller.js
export const crearTurno = async (req, res, next) => {
  try {
    const turno = await turnoService.crear(req.body)
    
    // Notificar al profesional via WebSocket
    const io = req.app.get('io')
    io.of('/profesional')
      .to(`profesional:${turno.profesionalId}`)
      .emit('turno:nuevo', {
        id: turno.id,
        referencia: turno.referencia,
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        paciente: turno.Paciente
      })
    
    res.status(201).json({ success: true, data: turno })
  } catch (error) {
    next(error)
  }
}
```

## Conexión desde React (frontend)

```jsx
// hooks/useSocket.jsx
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'

export function useSocket() {
  const socketRef = useRef(null)
  const { token } = useAuthStore()
  
  useEffect(() => {
    if (!token) return
    
    socketRef.current = io(`${import.meta.env.VITE_API_URL}/profesional`, {
      auth: { token }
    })
    
    socketRef.current.on('turno:nuevo', (turno) => {
      toast.success(`Nuevo turno: ${turno.referencia}`)
      // Invalidar queries de TanStack Query para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['turnos-pendientes'] })
    })
    
    socketRef.current.on('turno:cancelado', (turno) => {
      toast.error(`Turno cancelado: ${turno.referencia}`)
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    })
    
    return () => {
      socketRef.current?.disconnect()
    }
  }, [token])
  
  return socketRef.current
}
```

## Eventos del sistema

```javascript
// Eventos que el servidor emite al profesional
'turno:nuevo'        → { id, referencia, fecha, horaInicio, paciente }
'turno:cancelado'    → { id, referencia, motivoCancelacion }
'turno:confirmado'   → { id, referencia }
'pago:confirmado'    → { turnoId, monto, pasarela }
'metricas:update'    → { turnosHoy, pendientes }
```

## Middleware de autenticación Socket

```javascript
// config/socket.js
const authSocketMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    next()
  } catch (err) {
    next(new Error('Unauthorized'))
  }
}
```

## Reglas críticas

- ✅ Siempre autenticar con JWT antes de unirse a una sala
- ✅ Salas privadas por profesionalId — nunca broadcast global
- ✅ Combinar con TanStack Query invalidation para consistencia
- ❌ NO enviar datos de otros profesionales a la sala equivocada
