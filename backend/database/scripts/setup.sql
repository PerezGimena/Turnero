-- ============================================================
--  TurnoSalud — Script de creación de base de datos
--  Motor: MySQL 8+
--  Autor: generado por GitHub Copilot
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
    estado ENUM('pendiente','confirmado','cancelado','ausente','completado') DEFAULT 'pendiente',
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
    INDEX idx_turno_estado (estado)
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
    FOREIGN KEY (pacienteId) REFERENCES Pacientes(id) ON DELETE CASCADE
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

-- ============================================================
--  Los datos de prueba (seed) con contraseñas hasheadas se
--  insertan ejecutando el seeder Node.js:
--    cd backend && npm run seed
--  Ver: backend/database/seeders/index.js
-- ============================================================
