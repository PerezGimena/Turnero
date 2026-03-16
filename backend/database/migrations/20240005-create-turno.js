'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Turnos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referencia: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
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
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Pacientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      horaInicio: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      horaFin: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      duracion: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      modalidad: {
        type: Sequelize.ENUM('presencial', 'virtual', 'ambas'),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'confirmado', 'cancelado', 'ausente', 'completado'),
        defaultValue: 'pendiente'
      },
      motivoConsulta: {
        type: Sequelize.TEXT
      },
      motivoCancelacion: {
        type: Sequelize.TEXT
      },
      pagoId: {
        type: Sequelize.INTEGER
      },
      creadoManualmente: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex('Turnos', ['profesionalId', 'fecha']);
    await queryInterface.addIndex('Turnos', ['referencia']);
    await queryInterface.addIndex('Turnos', ['estado']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Turnos');
  }
};
