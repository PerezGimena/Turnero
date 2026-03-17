'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('Pagos', ['pasarela', 'transaccionId'], {
      name: 'uq_pagos_pasarela_transaccion',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Pagos', 'uq_pagos_pasarela_transaccion');
  },
};
