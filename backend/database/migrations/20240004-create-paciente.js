'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pacientes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profesionales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      dni: {
        type: Sequelize.STRING(20)
      },
      tieneObraSocial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      obraSocial: {
        type: Sequelize.STRING(200)
      },
      numeroAfiliado: {
        type: Sequelize.STRING(100)
      },
      aceptaRecordatorios: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Pacientes', ['profesionalId', 'email']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pacientes');
  }
};
