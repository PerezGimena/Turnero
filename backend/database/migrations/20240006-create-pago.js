'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pagos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      turnoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Turnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      moneda: {
        type: Sequelize.ENUM('ARS', 'USD'),
        defaultValue: 'ARS'
      },
      pasarela: {
        type: Sequelize.ENUM('mercadopago', 'stripe'),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado', 'reembolsado'),
        defaultValue: 'pendiente'
      },
      transaccionId: {
        type: Sequelize.STRING(255)
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
    await queryInterface.dropTable('Pagos');
  }
};
