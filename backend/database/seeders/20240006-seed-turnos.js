'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    await queryInterface.bulkInsert('Turnos', [
      // Profesional 1
      {
        referencia: 'TRN-A1B2C3',
        profesionalId: 1,
        pacienteId: 1,
        fecha: formatDate(tomorrow),
        horaInicio: '09:00',
        horaFin: '09:30',
        duracion: 30,
        modalidad: 'presencial',
        estado: 'confirmado',
        motivoConsulta: 'Chequeo general',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-D4E5F6',
        profesionalId: 1,
        pacienteId: 2,
        fecha: formatDate(tomorrow),
        horaInicio: '09:30',
        horaFin: '10:00',
        duracion: 30,
        modalidad: 'presencial',
        estado: 'pendiente',
        motivoConsulta: 'Dolor de cabeza',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-G7H8I9',
        profesionalId: 1,
        pacienteId: 5,
        fecha: formatDate(nextWeek),
        horaInicio: '10:00',
        horaFin: '10:30',
        duracion: 30,
        modalidad: 'presencial',
        estado: 'cancelado',
        motivoCancelacion: 'El paciente no puede asistir',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-J0K1L2',
        profesionalId: 1,
        pacienteId: 1,
        fecha: formatDate(yesterday),
        horaInicio: '11:00',
        horaFin: '11:30',
        duracion: 30,
        modalidad: 'presencial',
        estado: 'completado',
        motivoConsulta: 'Control resultados',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Profesional 2
      {
        referencia: 'TRN-M3N4O5',
        profesionalId: 2,
        pacienteId: 3,
        fecha: formatDate(tomorrow),
        horaInicio: '14:00',
        horaFin: '14:50',
        duracion: 50,
        modalidad: 'virtual',
        estado: 'confirmado',
        motivoConsulta: 'Sesión semanal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-P6Q7R8',
        profesionalId: 2,
        pacienteId: 4,
        fecha: formatDate(tomorrow),
        horaInicio: '15:00',
        horaFin: '15:50',
        duracion: 50,
        modalidad: 'presencial',
        estado: 'pendiente',
        motivoConsulta: 'Primera consulta',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-S9T0U1',
        profesionalId: 2,
        pacienteId: 3,
        fecha: formatDate(nextWeek),
        horaInicio: '14:00',
        horaFin: '14:50',
        duracion: 50,
        modalidad: 'virtual',
        estado: 'confirmado',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-V2W3X4',
        profesionalId: 2,
        pacienteId: 4,
        fecha: formatDate(yesterday),
        horaInicio: '16:00',
        horaFin: '16:50',
        duracion: 50,
        modalidad: 'virtual',
        estado: 'ausente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-Y5Z6A7',
        profesionalId: 1,
        pacienteId: 2,
        fecha: formatDate(nextWeek),
        horaInicio: '11:30',
        horaFin: '12:00',
        duracion: 30,
        modalidad: 'presencial',
        estado: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        referencia: 'TRN-B8C9D0',
        profesionalId: 2,
        pacienteId: 3,
        fecha: formatDate(nextWeek),
        horaInicio: '15:00',
        horaFin: '15:50',
        duracion: 50,
        modalidad: 'virtual',
        estado: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Turnos', null, {});
  }
};
