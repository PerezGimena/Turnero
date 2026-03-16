'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionDias', {
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
      dia: {
        type: Sequelize.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
      },
      habilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      horaInicio: {
        type: Sequelize.STRING(5)
      },
      horaFin: {
        type: Sequelize.STRING(5)
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ConfiguracionDias');
  }
};
