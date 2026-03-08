## FRONTEND - Estado de implementación

### Módulo Público (Pacientes)
- **[CONECTADA]** `src/pages/pacientes/LandingProfesionalPage.jsx`: Obtiene perfil del profesional (`GET /api/publico/:slug`).
- **[CONECTADA]** `src/pages/pacientes/CalendarioReservaPage.jsx`: Obtiene slots disponibles (`GET /api/publico/:slug/horarios`).
- **[CONECTADA]** `src/pages/pacientes/FormularioReservaPage.jsx`: Envía la reserva (`POST /api/publico/:slug/reservar`).
- **[CONECTADA]** `src/pages/pacientes/ConfirmacionPendientePage.jsx`: Renderiza éxito basado en la navegación (state).
- **[CONECTADA]** `src/pages/pacientes/TurnoConfirmadoPage.jsx`: Obtiene datos del profesional (`GET /api/publico/:slug`) y renderiza detalles.
- **[DATOS MOCK]** `src/pages/pacientes/GestionTurnoPage.jsx`: Vista para gestionar turno. Usa objeto `turnoMock`.

### Módulo Profesional
- **[CONECTADA]** `src/pages/profesional/RegistroPage.jsx`: Registro de nuevos profesionales (`POST /api/auth/profesional/registro`).
- **[CONECTADA]** `src/pages/profesional/LoginPage.jsx`: Autenticación real (`POST /api/auth/profesional/login`).
- **[CONECTADA]** `src/pages/profesional/DashboardProfesionalPage.jsx`: Métricas y listados conectados (`GET /api/profesional/dashboard/metricas`).
- **[CONECTADA]** `src/pages/profesional/AgendaProfesionalPage.jsx`: Calendario visual conectado (`GET /api/profesional/turnos`).
- **[CONECTADA]** `src/pages/profesional/TurnosPendientesPage.jsx`: Lista y gestiona turnos pendientes (`GET`, `PATCH`).
- **[CONECTADA]** `src/pages/profesional/PerfilPublicoPage.jsx`: Edición de perfil y horarios (`GET`, `PUT`).
- **[DATOS MOCK]** `src/pages/profesional/PacientesPage.jsx`: Lista de pacientes hardcodeada.
- **[DATOS MOCK]** `src/pages/profesional/ConfigRecordatoriosPage.jsx`: Configuración simulada.
- **[DATOS MOCK]** `src/pages/profesional/ConfigPagosPage.jsx`: Configuración simulada.
- **[DATOS MOCK]** `src/pages/profesional/PagosRecibidosPage.jsx`: Tabla estática.

### Módulo Admin (SaaS)
- **[DATOS MOCK]** `src/pages/admin/AdminLoginPage.jsx`: Simula login con `setTimeout`. Backend tiene endpoint listo.
- **[DATOS MOCK]** `src/pages/admin/DashboardAdminPage.jsx`: Métricas falsas.
- **[DATOS MOCK]** `src/pages/admin/GestionProfesionalesPage.jsx`: Tabla ABM sin conexión.

---

## BACKEND - Estado de endpoints

### Auth (`/api/auth`)
- **[IMPLEMENTADO]** `POST /profesional/registro`: Registro de nuevos profesionales.
- **[IMPLEMENTADO]** `POST /profesional/login`: Login con JWT.
- **[IMPLEMENTADO]** `POST /admin/login`: Login con JWT.
- **[IMPLEMENTADO]** `GET /profesional/me`: Obtener perfil autenticado.
- **[IMPLEMENTADO]** `GET /admin/me`: Obtener perfil autenticado.

### Admin (`/api/admin`)
- **[IMPLEMENTADO]** `GET /profesionales`: Listado con paginación y filtros.
- **[IMPLEMENTADO]** `POST /profesionales`: Alta de nuevo profesional SaaS.
- **[IMPLEMENTADO]** `PATCH /profesionales/:id/estado`: Activar/Suspender plan.
- **[IMPLEMENTADO]** `DELETE /profesionales/:id`: Baja lógica/física.
- **[IMPLEMENTADO]** `POST /profesionales/:id/impersonar`: Generar token de acceso como profesional.
- **[IMPLEMENTADO]** `GET /dashboard/metricas`: KPIs globales.

### Profesional (`/api/profesional`)
- **[IMPLEMENTADO]** `GET /turnos`: Listado de turnos con filtros (fecha, estado).
- **[IMPLEMENTADO]** `POST /turnos`: Crear turno manual.
- **[IMPLEMENTADO]** `GET /turnos/:id`: Detalle de turno.
- **[IMPLEMENTADO]** `PATCH /turnos/:id/confirmar`: Aceptar turno pendiente.
- **[IMPLEMENTADO]** `PATCH /turnos/:id/rechazar`: Cancelar turno pendiente.
- **[IMPLEMENTADO]** `GET /pacientes`: Listado de pacientes históricos.
- **[IMPLEMENTADO]** `GET /pacientes/:id`: Detalle e historial de paciente.
- **[IMPLEMENTADO]** `GET /perfil`: Obtener configuración del perfil.
- **[IMPLEMENTADO]** `PUT /perfil`: Actualizar datos y días de atención.
- **[IMPLEMENTADO]** `GET /dashboard/metricas`: KPIs del profesional.
- **[IMPLEMENTADO]** `POST /recordatorios/prueba`: Enviar email de prueba.

### Público (`/api/publico`)
- **[IMPLEMENTADO]** `GET /:slug`: Perfil público del profesional.
- **[IMPLEMENTADO]** `GET /:slug/horarios`: Cálculo de slots disponibles.
- **[IMPLEMENTADO]** `POST /:slug/reservar`: Creación de reserva (Maneja validaciones y creación de paciente).

---

## BASE DE DATOS

Modelos definidos en Sequelize (`backend/src/models/`):
- **Admin**: `id`, `email`, `passwordHash`.
- **Profesional**: `id`, `slug`, `email`, `passwordHash`, associations (dias, recordatorios, etc).
- **Turno**: `id`, `referencia`, `fecha`, `horaInicio`, `estado`, `modalidad`.
- **Paciente**: `id`, `email`, `dni`, `obraSocial`.
- **ConfiguracionDia**: `dia`, `horaInicio`, `horaFin`, `habilitado`.
- **ConfiguracionRecordatorios**: `whatsappHabilitado`, `mensajeEmail`, `mensajeWhatsapp`.

El esquema de modelos coincide con la implementación de los controladores.

---

## PRÓXIMOS PASOS (Prioridad Alta)

El sistema para **Profesionales** está casi completo (Agenda, Turnos, Dashboard, Perfil, Login/Registro). El sistema **Público** está funcional.

El foco ahora debe estar en conectar el **Panel Admin (SaaS)** y finalizar las secciones secundarias del profesional (Pacientes, Recordatorios).

1.  **Conectar Módulo Admin**:
    -   Implementar `AdminLoginPage.jsx` real.
    -   Conectar `DashboardAdminPage.jsx` a KPIs reales.
    -   Conectar `GestionProfesionalesPage.jsx` al CRUD de backend.
2.  **Módulo Pacientes (Profesional)**:
    -   Conectar `PacientesPage.jsx` a `GET /api/profesional/pacientes`.
3.  **Configuraciones Avanzadas**:
    -   Implementar backend y frontend para `ConfigRecordatoriosPage.jsx`.
    -   Definir estrategia de Pagos (`ConfigPagosPage.jsx`).
4.  **Gestión de Turnos (Público)**:
    -   Implementar lógica real en `GestionTurnoPage.jsx` (requiere endpoint para validar referencia/token de turno).