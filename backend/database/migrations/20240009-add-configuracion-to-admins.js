'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Admins', 'configuracion', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Configuración de integraciones de la plataforma (MP_CLIENT_ID, STRIPE_CLIENT_ID, etc.)'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Admins', 'configuracion');
  }
};
