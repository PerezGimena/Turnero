-- ============================================================
--  TurnoSalud — Script de creación de base de datos
--  Motor: MySQL 8+
--  Esquema sincronizado con migraciones hasta: 20240010
--  IMPORTANTE: Las contraseñas de prueba se insertan con el
--  seeder Node.js (database/seeders/index.js) que genera
--  hashes bcrypt reales. NO usar este archivo para contraseñas.
-- ============================================================

-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS turnosalud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE turnosalud;

-- 2. Crear tablas (Orden para respetar FK)

-- Tabla Admin
CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    configuracion JSON,                        -- migración 20240009
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Profesional
CREATE TABLE IF NOT EXISTS Profesionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    especialidad VARCHAR(150),
    descripcion TEXT,
    fotoPerfil VARCHAR(500),
    modalidad ENUM('presencial','virtual','ambas') DEFAULT 'presencial',
    aceptaObrasSociales BOOLEAN DEFAULT false,
    obrasSocialesTexto TEXT,
    duracionTurno INT DEFAULT 30,
    tiempoDescanso INT DEFAULT 0,
    confirmacionAutomatica BOOLEAN DEFAULT true,
    pagoObligatorio BOOLEAN DEFAULT false,
    montoPorTurno DECIMAL(10,2),
    moneda ENUM('ARS','USD') DEFAULT 'ARS',
    pasarelaPago ENUM('mercadopago','stripe'),
    pagoCredenciales TEXT,
    direccion VARCHAR(500),
    linkVideollamada VARCHAR(500),
    planActivo BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_profesional_slug (slug),
    INDEX idx_profesional_email (email)
);

-- Tabla ConfiguracionDia
CREATE TABLE IF NOT EXISTS ConfiguracionDias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    dia ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
    habilitado BOOLEAN DEFAULT false,
    horaInicio VARCHAR(5),
    horaFin VARCHAR(5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE
);

-- Tabla Paciente
CREATE TABLE IF NOT EXISTS Pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(20),
    tieneObraSocial BOOLEAN DEFAULT false,
    obraSocial VARCHAR(200),
    numeroAfiliado VARCHAR(100),
    aceptaRecordatorios BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    INDEX idx_paciente_profesional_email (profesionalId, email)
);

-- Tabla Turno
CREATE TABLE IF NOT EXISTS Turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referencia VARCHAR(20) UNIQUE NOT NULL,
    profesionalId INT NOT NULL,
    pacienteId INT NOT NULL,
    fecha DATE NOT NULL,
    horaInicio VARCHAR(5) NOT NULL,
    horaFin VARCHAR(5) NOT NULL,
    duracion INT NOT NULL,
    modalidad ENUM('presencial','virtual','ambas') NOT NULL,
    estado ENUM('pendiente','pendiente_pago','confirmado','cancelado','ausente','completado') DEFAULT 'pendiente',
    motivoConsulta TEXT,
    motivoCancelacion TEXT,
    pagoId INT,
    creadoManualmente BOOLEAN DEFAULT false,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    FOREIGN KEY (pacienteId) REFERENCES Pacientes(id) ON DELETE CASCADE,
    INDEX idx_turno_profesional_fecha (profesionalId, fecha),
    INDEX idx_turno_referencia (referencia),
    INDEX idx_turno_estado (estado),
    INDEX idx_turnos_paciente (pacienteId)           -- migración 20240010
);

-- Tabla Pago
CREATE TABLE IF NOT EXISTS Pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turnoId INT NOT NULL,
    profesionalId INT NOT NULL,
    pacienteId INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    moneda ENUM('ARS','USD') DEFAULT 'ARS',
    pasarela ENUM('mercadopago','stripe') NOT NULL,
    estado ENUM('pendiente','aprobado','rechazado','reembolsado') DEFAULT 'pendiente',
    transaccionId VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (turnoId) REFERENCES Turnos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    FOREIGN KEY (pacienteId) REFERENCES Pacientes(id) ON DELETE CASCADE,
    INDEX idx_pagos_profesional_estado (profesionalId, estado),   -- migración 20240010
    INDEX idx_pagos_pasarela_estado (pasarela, estado),           -- migración 20240010
    INDEX idx_pagos_transaccion (transaccionId)                   -- migración 20240010
);

-- Tabla ConfiguracionRecordatorios
CREATE TABLE IF NOT EXISTS ConfiguracionRecordatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT UNIQUE NOT NULL,
    emailHabilitado BOOLEAN DEFAULT true,
    whatsappHabilitado BOOLEAN DEFAULT false,
    whatsappNumero VARCHAR(30),
    recordatorio1Habilitado BOOLEAN DEFAULT true,
    recordatorio1HorasAntes INT DEFAULT 24,
    recordatorio2Habilitado BOOLEAN DEFAULT false,
    recordatorio2HorasAntes INT DEFAULT 2,
    recordatorio3Habilitado BOOLEAN DEFAULT false,
    recordatorio3HorasAntes INT,
    mensajeEmail TEXT,
    mensajeWhatsapp TEXT,
    recordatorioAusencia BOOLEAN DEFAULT false,
    mensajeAusencia TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE
);

-- Conexiones OAuth por profesional y proveedor
CREATE TABLE IF NOT EXISTS OAuthConnections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    provider ENUM('mercadopago','stripe') NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    providerUserId VARCHAR(255),
    providerEmail VARCHAR(255),
    publishableKey VARCHAR(255),
    tokenExpiresAt DATETIME,
    status ENUM('conectado','desconectado','error') DEFAULT 'conectado',
    metadata JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    UNIQUE KEY uq_oauthconnections_profesional_provider (profesionalId, provider),
    INDEX idx_oauthconnections_provider_status (provider, status)
);

-- ============================================================
--  Esquema SaaS optimizado (migracion 20240011)
-- ============================================================

-- Catalogo de obras sociales
CREATE TABLE IF NOT EXISTS ObrasSociales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    codigo VARCHAR(50),
    activa BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Relacion N:N entre profesionales y obras sociales
CREATE TABLE IF NOT EXISTS ProfesionalObrasSociales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    obraSocialId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    FOREIGN KEY (obraSocialId) REFERENCES ObrasSociales(id) ON DELETE CASCADE,
    UNIQUE KEY uq_profesional_obra_social (profesionalId, obraSocialId),
    INDEX idx_pos_profesional (profesionalId),
    INDEX idx_pos_obra_social (obraSocialId)
);

-- Historial de cambios de estado de turnos
CREATE TABLE IF NOT EXISTS TurnoHistoriales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    turnoId INT NOT NULL,
    estadoAnterior ENUM('pendiente','pendiente_pago','confirmado','cancelado','ausente','completado'),
    estadoNuevo ENUM('pendiente','pendiente_pago','confirmado','cancelado','ausente','completado') NOT NULL,
    motivo TEXT,
    actorTipo ENUM('admin','profesional','sistema') DEFAULT 'sistema',
    actorId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (turnoId) REFERENCES Turnos(id) ON DELETE CASCADE,
    INDEX idx_turno_historial_turno_fecha (turnoId, createdAt),
    INDEX idx_turno_historial_estado_fecha (estadoNuevo, createdAt)
);

-- Auditoria general de entidades
CREATE TABLE IF NOT EXISTS Auditorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actorTipo ENUM('admin','profesional','sistema') DEFAULT 'sistema',
    actorId INT,
    entidad VARCHAR(80) NOT NULL,
    entidadId INT,
    accion VARCHAR(80) NOT NULL,
    cambiosAntes JSON,
    cambiosDespues JSON,
    metadata JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auditoria_entidad_fecha (entidad, entidadId, createdAt),
    INDEX idx_auditoria_actor_fecha (actorTipo, actorId, createdAt)
);

-- Excepciones de agenda (bloqueos, sobreturnos, feriados)
CREATE TABLE IF NOT EXISTS ExcepcionesAgenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    fecha DATE NOT NULL,
    horaInicio VARCHAR(5),
    horaFin VARCHAR(5),
    tipo ENUM('bloqueo','sobreturno','feriado') DEFAULT 'bloqueo',
    motivo TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    INDEX idx_excepciones_agenda_prof_fecha_tipo (profesionalId, fecha, tipo)
);

-- Log de envios de notificaciones
CREATE TABLE IF NOT EXISTS NotificacionesEnvios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profesionalId INT NOT NULL,
    pacienteId INT,
    turnoId INT,
    canal ENUM('email','whatsapp') NOT NULL,
    tipo ENUM('confirmacion','recordatorio','ausencia','pendiente_pago','otro') DEFAULT 'otro',
    estado ENUM('pendiente','enviado','fallido') DEFAULT 'pendiente',
    errorMensaje TEXT,
    enviadoAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesionalId) REFERENCES Profesionales(id) ON DELETE CASCADE,
    FOREIGN KEY (pacienteId) REFERENCES Pacientes(id) ON DELETE SET NULL,
    FOREIGN KEY (turnoId) REFERENCES Turnos(id) ON DELETE SET NULL,
    INDEX idx_notif_prof_fecha (profesionalId, createdAt),
    INDEX idx_notif_turno_canal (turnoId, canal),
    INDEX idx_notif_estado_fecha (estado, createdAt)
);

-- ============================================================
--  Indices adicionales para escala (migracion 20240011)
-- ============================================================

CREATE INDEX idx_config_dias_profesional_dia ON ConfiguracionDias(profesionalId, dia);
CREATE INDEX idx_pacientes_prof_apellido_nombre ON Pacientes(profesionalId, apellido, nombre);
CREATE INDEX idx_pacientes_prof_created ON Pacientes(profesionalId, createdAt);
CREATE INDEX idx_turnos_prof_estado_fecha_hora ON Turnos(profesionalId, estado, fecha, horaInicio);
CREATE INDEX idx_turnos_prof_fecha_hora ON Turnos(profesionalId, fecha, horaInicio);
CREATE INDEX idx_turnos_paciente_fecha ON Turnos(pacienteId, fecha);
CREATE INDEX idx_pagos_prof_created ON Pagos(profesionalId, createdAt);
CREATE INDEX idx_pagos_estado_created ON Pagos(estado, createdAt);
CREATE UNIQUE INDEX uq_pagos_pasarela_transaccion ON Pagos(pasarela, transaccionId);
CREATE INDEX idx_profesionales_plan_created ON Profesionales(planActivo, createdAt);
CREATE INDEX idx_profesionales_especialidad_plan ON Profesionales(especialidad, planActivo);

-- ============================================================
--  Los datos de prueba (seed) con contraseñas hasheadas se
--  insertan ejecutando el seeder Node.js:
--    cd backend && npm run seed
--  Ver: backend/database/seeders/index.js
-- ============================================================
