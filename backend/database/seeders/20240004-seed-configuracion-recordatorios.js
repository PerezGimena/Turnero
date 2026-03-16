'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ConfiguracionRecordatorios', [
      {
        profesionalId: 1,
        emailHabilitado: true,
        whatsappHabilitado: false,
        recordatorio1Habilitado: true,
        recordatorio1HorasAntes: 24,
        mensajeEmail: 'Hola, recordá tu turno con el Dr. Juan Pérez mañana. En caso de no poder asistir, por favor cancelá con anticipación.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        profesionalId: 2,
        emailHabilitado: true,
        whatsappHabilitado: true,
        whatsappNumero: '5491112345678',
        recordatorio1Habilitado: true,
        recordatorio1HorasAntes: 48,
        mensajeEmail: 'Recordatorio de sesión con Lic. María González.',
        mensajeWhatsapp: 'Hola, recordá tu sesión con Lic. María González.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ConfiguracionRecordatorios', null, {});
  }
};
