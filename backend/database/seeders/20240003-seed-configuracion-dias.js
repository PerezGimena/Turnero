'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const seeds = [];

    // Profesional 1: L-V 09-17
    dias.forEach(dia => {
      seeds.push({
        profesionalId: 1,
        dia: dia,
        habilitado: true,
        horaInicio: '09:00',
        horaFin: '17:00',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Profesional 2: L-V 09-17
    dias.forEach(dia => {
      seeds.push({
        profesionalId: 2,
        dia: dia,
        habilitado: true,
        horaInicio: '09:00',
        horaFin: '17:00',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await queryInterface.bulkInsert('ConfiguracionDias', seeds, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ConfiguracionDias', null, {});
  }
};
