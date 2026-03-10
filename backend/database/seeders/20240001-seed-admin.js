'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // IMPORTANTE: password unificada con database/seeders/index.js
    // Si ya corriste `npm run seed`, este seeder NO sobreescribirá el registro (ON DUPLICATE IGNORE)
    const hashedPassword = bcrypt.hashSync('Admin123!', 10);
    
    await queryInterface.bulkInsert('Admins', [{
      email: 'admin@turnosalud.com',
      passwordHash: hashedPassword,
      nombre: 'Administrador Principal',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { ignoreDuplicates: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', { email: 'admin@turnosalud.com' }, {});
  }
};
