'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionRecordatorios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Profesionales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      emailHabilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      whatsappHabilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      whatsappNumero: {
        type: Sequelize.STRING(30)
      },
      recordatorio1Habilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      recordatorio1HorasAntes: {
        type: Sequelize.INTEGER,
        defaultValue: 24
      },
      recordatorio2Habilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      recordatorio2HorasAntes: {
        type: Sequelize.INTEGER,
        defaultValue: 2
      },
      recordatorio3Habilitado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      recordatorio3HorasAntes: {
        type: Sequelize.INTEGER
      },
      mensajeEmail: {
        type: Sequelize.TEXT
      },
      mensajeWhatsapp: {
        type: Sequelize.TEXT
      },
      recordatorioAusencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mensajeAusencia: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('ConfiguracionRecordatorios');
  }
};
