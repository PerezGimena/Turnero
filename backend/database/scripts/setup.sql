-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS turnosalud;
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

-- 3. Inserts de prueba

-- Admin
INSERT INTO Admins (email, passwordHash, nombre) VALUES 
('admin@turnosalud.com', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'Super Admin'); -- Password placeholder, debe ser hash real en app

-- Profesional 1 (Dr. Juan Pérez - Cardiología)
INSERT INTO Profesionales (slug, nombre, apellido, email, passwordHash, especialidad, descripcion, modalidad, duracionTurno, montoPorTurno) VALUES
('juan-perez', 'Juan', 'Pérez', 'juan@medico.com', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'Cardiología', 'Especialista en corazón', 'ambas', 30, 5000.00);

-- Profesional 2 (Dra. Ana Gómez - Dermatología)
INSERT INTO Profesionales (slug, nombre, apellido, email, passwordHash, especialidad, descripcion, modalidad, duracionTurno, montoPorTurno) VALUES
('ana-gomez', 'Ana', 'Gómez', 'ana@medica.com', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'Dermatología', 'Cuidado de la piel', 'presencial', 20, 4000.00);

-- Configuración Días para Juan Pérez (Lunes a Viernes 9-17)
INSERT INTO ConfiguracionDias (profesionalId, dia, habilitado, horaInicio, horaFin) VALUES
(1, 'lunes', true, '09:00', '17:00'),
(1, 'martes', true, '09:00', '17:00'),
(1, 'miercoles', true, '09:00', '17:00'),
(1, 'jueves', true, '09:00', '17:00'),
(1, 'viernes', true, '09:00', '17:00');

-- Configuración Recordatorios para Juan Pérez
INSERT INTO ConfiguracionRecordatorios (profesionalId, emailHabilitado, whatsappHabilitado) VALUES
(1, true, false);

-- Pacientes para Juan Pérez
INSERT INTO Pacientes (profesionalId, nombre, apellido, email, telefono) VALUES
(1, 'Carlos', 'Lopez', 'carlos@paciente.com', '1112345678'),
(1, 'Maria', 'Rodriguez', 'maria@paciente.com', '1187654321'),
(1, 'Pedro', 'Sanchez', 'pedro@paciente.com', '1122334455'),
(2, 'Laura', 'Gomez', 'laura@paciente.com', '1199887766'),
(2, 'Sofia', 'Martinez', 'sofia@paciente.com', '1155667788');

-- Turnos para Juan Pérez
INSERT INTO Turnos (referencia, profesionalId, pacienteId, fecha, horaInicio, horaFin, duracion, modalidad, estado) VALUES
('TRN-ABC12345', 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00', '10:30', 30, 'presencial', 'confirmado'),
('TRN-ABC12346', 1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00', '11:30', 30, 'presencial', 'pendiente'),
('TRN-ABC12347', 1, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00', '09:30', 30, 'virtual', 'cancelado'),
('TRN-ABC12348', 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00', '15:30', 30, 'presencial', 'completado'),
('TRN-ABC12349', 1, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '16:00', '16:30', 30, 'presencial', 'pendiente'),
('TRN-ABC12350', 2, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00', '14:20', 20, 'presencial', 'confirmado'),
('TRN-ABC12351', 2, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:20', '14:40', 20, 'presencial', 'ausente'),
('TRN-ABC12352', 2, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00', '10:20', 20, 'presencial', 'pendiente'),
('TRN-ABC12353', 2, 5, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00', '11:20', 20, 'presencial', 'confirmado'),
('TRN-ABC12354', 1, 3, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '12:00', '12:30', 30, 'virtual', 'pendiente');
