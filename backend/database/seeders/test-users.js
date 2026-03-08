/**
 * TurnoSalud — Seed usuarios de prueba
 * Ejecutar con: node database/seeders/test-users.js  (desde /backend)
 *
 * Crea:
 *   - Profesional de prueba  → test@profesional.com  / 12345678
 *   - Paciente de prueba     → paciente@test.com     (asociado al profesional anterior)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Profesional, ConfiguracionDia, ConfiguracionRecordatorios, Paciente } = require('../../src/models');

async function seedTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida.\n');

    // ── PROFESIONAL DE PRUEBA ──────────────────────────────────────
    const passHash = await bcrypt.hash('12345678', 10);

    const [prof, profCreado] = await Profesional.findOrCreate({
      where: { email: 'test@profesional.com' },
      defaults: {
        slug: 'test-profesional',
        nombre: 'Test',
        apellido: 'Profesional',
        email: 'test@profesional.com',
        passwordHash: passHash,
        especialidad: 'Medicina General',
        descripcion: 'Profesional de prueba para desarrollo y testing.',
        modalidad: 'ambas',
        aceptaObrasSociales: false,
        duracionTurno: 30,
        tiempoDescanso: 5,
        confirmacionAutomatica: true,
        pagoObligatorio: false,
        montoPorTurno: 1000.00,
        moneda: 'ARS',
        direccion: 'Calle Falsa 123, Buenos Aires',
        planActivo: true,
        permiteReprogramar: true,
        horasMinCancelacion: 24,
      }
    });

    if (profCreado) {
      // Configurar días hábiles (lun-vie habilitados)
      const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      await Promise.all(dias.map(dia => ConfiguracionDia.findOrCreate({
        where: { profesionalId: prof.id, dia },
        defaults: {
          profesionalId: prof.id,
          dia,
          horaInicio: '09:00',
          horaFin: '17:00',
          habilitado: !['sabado', 'domingo'].includes(dia)
        }
      })));

      await ConfiguracionRecordatorios.findOrCreate({
        where: { profesionalId: prof.id },
        defaults: {
          profesionalId: prof.id,
          emailHabilitado: true,
          recordatorio1Habilitado: true,
          recordatorio1HorasAntes: 24,
          mensajeEmail: 'Hola {{nombre}}, te recordamos tu turno el día {{fecha}} a las {{hora}} hs.'
        }
      });

      console.log('  ✅ Profesional de prueba creado');
    } else {
      console.log('  ℹ️  Profesional ya existía — no se modificó');
    }
    console.log(`     Email:    test@profesional.com`);
    console.log(`     Password: 12345678`);
    console.log(`     Slug:     test-profesional`);
    console.log(`     ID:       ${prof.id}\n`);

    // ── PACIENTE DE PRUEBA ─────────────────────────────────────────
    // Nota: en este sistema los pacientes NO tienen login propio.
    // Son registros vinculados a un profesional.
    const [paciente, pacienteCreado] = await Paciente.findOrCreate({
      where: { email: 'paciente@test.com', profesionalId: prof.id },
      defaults: {
        profesionalId: prof.id,
        nombre: 'Test',
        apellido: 'Paciente',
        email: 'paciente@test.com',
        telefono: '1123456789',
        dni: '12345678',
        tieneObraSocial: false,
        aceptaRecordatorios: true,
      }
    });

    if (pacienteCreado) {
      console.log('  ✅ Paciente de prueba creado');
    } else {
      console.log('  ℹ️  Paciente ya existía — no se modificó');
    }
    console.log(`     Nombre:   Test Paciente`);
    console.log(`     Email:    paciente@test.com`);
    console.log(`     DNI:      12345678`);
    console.log(`     ID:       ${paciente.id}`);
    console.log(`     Profesional ID: ${prof.id}\n`);

    console.log('─────────────────────────────────────────────');
    console.log('✅ Seed de usuarios de prueba completado.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  }
}

seedTestUsers();
