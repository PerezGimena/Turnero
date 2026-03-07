'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hashSync('Admin1234!', 10);
    
    await queryInterface.bulkInsert('Admins', [{
      email: 'admin@turnosalud.com',
      passwordHash: hashedPassword,
      nombre: 'Administrador Principal',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', { email: 'admin@turnosalud.com' }, {});
  }
};
