'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Pacientes', [
      {
        id: 1,
        profesionalId: 1,
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@example.com',
        telefono: '1122334455',
        dni: '20123456',
        tieneObraSocial: true,
        obraSocial: 'OSDE',
        numeroAfiliado: '123456789',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        profesionalId: 1,
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@example.com',
        telefono: '1133445566',
        dni: '25654321',
        tieneObraSocial: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        profesionalId: 2,
        nombre: 'Sofía',
        apellido: 'Ramírez',
        email: 'sofia.ramirez@example.com',
        telefono: '1144556677',
        dni: '30112233',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        profesionalId: 2,
        nombre: 'Diego',
        apellido: 'Torres',
        email: 'diego.torres@example.com',
        telefono: '1155667788',
        dni: '35887766',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        profesionalId: 1,
        nombre: 'Laura',
        apellido: 'Fernández',
        email: 'laura.fernandez@example.com',
        telefono: '1166778899',
        dni: '40998877',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Pacientes', null, {});
  }
};
