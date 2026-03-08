/**
 * TurnoSalud — Seeder de datos de prueba
 * Ejecutar con: npm run seed  (desde la carpeta /backend)
 *
 * Crea:
 *   - 1 Admin          → admin@turnosalud.com   / Admin123!
 *   - 2 Profesionales  → juan@medico.com         / Medico123!
 *                      → ana@medica.com          / Medico123!
 *   - Configuración de días y recordatorios para ambos
 *   - 5 Pacientes distribuidos entre los dos profesionales
 *   - 10 Turnos de ejemplo con distintos estados
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Profesional, ConfiguracionDia, ConfiguracionRecordatorios, Paciente, Turno } = require('../../src/models');

const SALT_ROUNDS = 10;

// Helper: fecha relativa a hoy
const diasDesdeHoy = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida.');

    // ── 1. ADMIN ──────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    const [admin, adminCreado] = await Admin.findOrCreate({
      where: { email: 'admin@turnosalud.com' },
      defaults: {
        email: 'admin@turnosalud.com',
        passwordHash: adminHash,
        nombre: 'Super Admin'
      }
    });
    console.log(adminCreado ? '  → Admin creado' : '  → Admin ya existía');

    // ── 2. PROFESIONALES ─────────────────────────────────────────
    const medicoHash = await bcrypt.hash('Medico123!', SALT_ROUNDS);

    const [prof1, prof1Creado] = await Profesional.findOrCreate({
      where: { email: 'juan@medico.com' },
      defaults: {
        slug: 'juan-perez',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@medico.com',
        passwordHash: medicoHash,
        especialidad: 'Cardiología',
        descripcion: 'Médico cardiólogo con más de 15 años de experiencia. Atención personalizada y de calidad.',
        modalidad: 'ambas',
        aceptaObrasSociales: true,
        obrasSocialesTexto: 'OSDE, Swiss Medical, Galeno',
        duracionTurno: 30,
        tiempoDescanso: 5,
        confirmacionAutomatica: true,
        pagoObligatorio: false,
        montoPorTurno: 5000.00,
        moneda: 'ARS',
        direccion: 'Av. Corrientes 1234, CABA',
        planActivo: true
      }
    });
    console.log(prof1Creado ? '  → Profesional Juan Pérez creado' : '  → Juan Pérez ya existía');

    const [prof2, prof2Creado] = await Profesional.findOrCreate({
      where: { email: 'ana@medica.com' },
      defaults: {
        slug: 'ana-gomez',
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@medica.com',
        passwordHash: medicoHash,
        especialidad: 'Dermatología',
        descripcion: 'Dermatóloga especializada en tratamientos estéticos y clínicos. Consultorio equipado con tecnología láser.',
        modalidad: 'presencial',
        aceptaObrasSociales: false,
        duracionTurno: 20,
        tiempoDescanso: 0,
        confirmacionAutomatica: false,
        pagoObligatorio: true,
        montoPorTurno: 4000.00,
        moneda: 'ARS',
        direccion: 'Av. Santa Fe 5678, CABA',
        planActivo: true
      }
    });
    console.log(prof2Creado ? '  → Profesional Ana Gómez creado' : '  → Ana Gómez ya existía');

    // ── 3. CONFIGURACIÓN DE DÍAS ─────────────────────────────────
    // Juan Pérez: Lunes a Viernes 09:00 – 17:00
    const diasJuan = [
      { dia: 'lunes',     habilitado: true,  horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'martes',    habilitado: true,  horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'miercoles', habilitado: true,  horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'jueves',    habilitado: true,  horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'viernes',   habilitado: true,  horaInicio: '09:00', horaFin: '17:00' },
      { dia: 'sabado',    habilitado: false, horaInicio: null,    horaFin: null    },
      { dia: 'domingo',   habilitado: false, horaInicio: null,    horaFin: null    }
    ];
    const existeDiaJuan = await ConfiguracionDia.findOne({ where: { profesionalId: prof1.id } });
    if (!existeDiaJuan) {
      for (const d of diasJuan) {
        await ConfiguracionDia.create({ profesionalId: prof1.id, ...d });
      }
      console.log('  → Días de Juan Pérez configurados');
    }

    // Ana Gómez: Martes, Jueves y Sábados 10:00 – 15:00
    const diasAna = [
      { dia: 'lunes',     habilitado: false, horaInicio: null,    horaFin: null    },
      { dia: 'martes',    habilitado: true,  horaInicio: '10:00', horaFin: '15:00' },
      { dia: 'miercoles', habilitado: false, horaInicio: null,    horaFin: null    },
      { dia: 'jueves',    habilitado: true,  horaInicio: '10:00', horaFin: '15:00' },
      { dia: 'viernes',   habilitado: false, horaInicio: null,    horaFin: null    },
      { dia: 'sabado',    habilitado: true,  horaInicio: '09:00', horaFin: '13:00' },
      { dia: 'domingo',   habilitado: false, horaInicio: null,    horaFin: null    }
    ];
    const existeDiaAna = await ConfiguracionDia.findOne({ where: { profesionalId: prof2.id } });
    if (!existeDiaAna) {
      for (const d of diasAna) {
        await ConfiguracionDia.create({ profesionalId: prof2.id, ...d });
      }
      console.log('  → Días de Ana Gómez configurados');
    }

    // ── 4. CONFIGURACIÓN DE RECORDATORIOS ────────────────────────
    await ConfiguracionRecordatorios.findOrCreate({
      where: { profesionalId: prof1.id },
      defaults: {
        profesionalId: prof1.id,
        emailHabilitado: true,
        whatsappHabilitado: false,
        recordatorio1Habilitado: true,
        recordatorio1HorasAntes: 24,
        recordatorio2Habilitado: true,
        recordatorio2HorasAntes: 2,
        recordatorio3Habilitado: false,
        mensajeEmail: 'Hola {{nombre}}, te recordamos tu turno con el Dr. Juan Pérez el {{fecha}} a las {{hora}} hs. Dirección: {{direccion}}. ¡Te esperamos!',
        mensajeWhatsapp: 'Hola {{nombre}}! Recordatorio de tu turno: {{fecha}} {{hora}} hs.',
        recordatorioAusencia: false
      }
    });
    await ConfiguracionRecordatorios.findOrCreate({
      where: { profesionalId: prof2.id },
      defaults: {
        profesionalId: prof2.id,
        emailHabilitado: true,
        whatsappHabilitado: false,
        recordatorio1Habilitado: true,
        recordatorio1HorasAntes: 48,
        recordatorio2Habilitado: false,
        recordatorio3Habilitado: false,
        mensajeEmail: 'Hola {{nombre}}, te recordamos tu turno con la Dra. Ana Gómez el {{fecha}} a las {{hora}} hs.',
        recordatorioAusencia: true,
        mensajeAusencia: 'Hola {{nombre}}, notamos que no pudiste asistir. Podés reprogramar tu turno cuando quieras.'
      }
    });
    console.log('  → Recordatorios configurados');

    // ── 5. PACIENTES ─────────────────────────────────────────────
    const pacientesData = [
      // Pacientes de Juan Pérez (prof1)
      { profesionalId: prof1.id, nombre: 'Carlos',  apellido: 'Lopez',     email: 'carlos@paciente.com', telefono: '1112345678', tieneObraSocial: true, obraSocial: 'OSDE' },
      { profesionalId: prof1.id, nombre: 'María',   apellido: 'Rodríguez', email: 'maria@paciente.com',  telefono: '1187654321', tieneObraSocial: false },
      { profesionalId: prof1.id, nombre: 'Pedro',   apellido: 'Sánchez',   email: 'pedro@paciente.com',  telefono: '1122334455', dni: '30123456', tieneObraSocial: true, obraSocial: 'Swiss Medical' },
      // Pacientes de Ana Gómez (prof2)
      { profesionalId: prof2.id, nombre: 'Laura',   apellido: 'Gómez',     email: 'laura@paciente.com',  telefono: '1199887766', tieneObraSocial: false },
      { profesionalId: prof2.id, nombre: 'Sofía',   apellido: 'Martínez',  email: 'sofia@paciente.com',  telefono: '1155667788', tieneObraSocial: false }
    ];

    const pacientesCreados = [];
    for (const p of pacientesData) {
      const [pac] = await Paciente.findOrCreate({
        where: { profesionalId: p.profesionalId, email: p.email },
        defaults: p
      });
      pacientesCreados.push(pac);
    }
    console.log('  → 5 Pacientes de prueba creados/verificados');

    // ── 6. TURNOS ─────────────────────────────────────────────────
    const [carlos, maria, pedro, laura, sofia] = pacientesCreados;

    const turnosData = [
      { referencia: 'TRN-SEED01', profesionalId: prof1.id, pacienteId: carlos.id, fecha: diasDesdeHoy(1),  horaInicio: '10:00', horaFin: '10:30', duracion: 30, modalidad: 'presencial', estado: 'confirmado',  motivoConsulta: 'Chequeo cardiológico anual' },
      { referencia: 'TRN-SEED02', profesionalId: prof1.id, pacienteId: maria.id,  fecha: diasDesdeHoy(1),  horaInicio: '11:00', horaFin: '11:30', duracion: 30, modalidad: 'presencial', estado: 'pendiente',   motivoConsulta: 'Consulta de control' },
      { referencia: 'TRN-SEED03', profesionalId: prof1.id, pacienteId: pedro.id,  fecha: diasDesdeHoy(2),  horaInicio: '09:00', horaFin: '09:30', duracion: 30, modalidad: 'virtual',    estado: 'cancelado',   motivoConsulta: 'Revisión post-operatoria', motivoCancelacion: 'El paciente no pudo asistir' },
      { referencia: 'TRN-SEED04', profesionalId: prof1.id, pacienteId: carlos.id, fecha: diasDesdeHoy(-2), horaInicio: '15:00', horaFin: '15:30', duracion: 30, modalidad: 'presencial', estado: 'completado',  motivoConsulta: 'Seguimiento tratamiento' },
      { referencia: 'TRN-SEED05', profesionalId: prof1.id, pacienteId: maria.id,  fecha: diasDesdeHoy(3),  horaInicio: '16:00', horaFin: '16:30', duracion: 30, modalidad: 'presencial', estado: 'pendiente',   motivoConsulta: 'Primera consulta' },
      { referencia: 'TRN-SEED06', profesionalId: prof2.id, pacienteId: laura.id,  fecha: diasDesdeHoy(1),  horaInicio: '10:00', horaFin: '10:20', duracion: 20, modalidad: 'presencial', estado: 'confirmado',  motivoConsulta: 'Consulta dermatológica' },
      { referencia: 'TRN-SEED07', profesionalId: prof2.id, pacienteId: sofia.id,  fecha: diasDesdeHoy(1),  horaInicio: '10:20', horaFin: '10:40', duracion: 20, modalidad: 'presencial', estado: 'ausente',     motivoConsulta: 'Revisión tratamiento facial' },
      { referencia: 'TRN-SEED08', profesionalId: prof2.id, pacienteId: laura.id,  fecha: diasDesdeHoy(2),  horaInicio: '11:00', horaFin: '11:20', duracion: 20, modalidad: 'presencial', estado: 'pendiente',   motivoConsulta: 'Control post-tratamiento' },
      { referencia: 'TRN-SEED09', profesionalId: prof2.id, pacienteId: sofia.id,  fecha: diasDesdeHoy(3),  horaInicio: '14:00', horaFin: '14:20', duracion: 20, modalidad: 'presencial', estado: 'confirmado',  motivoConsulta: 'Tratamiento láser' },
      { referencia: 'TRN-SEED10', profesionalId: prof1.id, pacienteId: pedro.id,  fecha: diasDesdeHoy(5),  horaInicio: '12:00', horaFin: '12:30', duracion: 30, modalidad: 'virtual',    estado: 'pendiente',   motivoConsulta: 'Segunda opinión' }
    ];

    let turnosNuevos = 0;
    for (const t of turnosData) {
      const [, creado] = await Turno.findOrCreate({ where: { referencia: t.referencia }, defaults: t });
      if (creado) turnosNuevos++;
    }
    console.log(`  → ${turnosNuevos} turno(s) de prueba creados (${turnosData.length - turnosNuevos} ya existían)`);

    // ── RESUMEN ───────────────────────────────────────────────────
    console.log('\n✅ Seed completado exitosamente.\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│  CREDENCIALES DE ACCESO                             │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  ADMIN                                              │');
    console.log('│    Email:  admin@turnosalud.com                     │');
    console.log('│    Pass:   Admin123!                                │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  PROFESIONAL 1 (slug: juan-perez)                   │');
    console.log('│    Email:  juan@medico.com                          │');
    console.log('│    Pass:   Medico123!                               │');
    console.log('│    URL:    /juan-perez                              │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  PROFESIONAL 2 (slug: ana-gomez)                    │');
    console.log('│    Email:  ana@medica.com                           │');
    console.log('│    Pass:   Medico123!                               │');
    console.log('│    URL:    /ana-gomez                               │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seed();
