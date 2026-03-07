'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profesionales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      especialidad: {
        type: Sequelize.STRING(150)
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      fotoPerfil: {
        type: Sequelize.STRING(500)
      },
      modalidad: {
        type: Sequelize.ENUM('presencial', 'virtual', 'ambas'),
        defaultValue: 'presencial'
      },
      aceptaObrasSociales: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      obrasSocialesTexto: {
        type: Sequelize.TEXT
      },
      duracionTurno: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      tiempoDescanso: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      confirmacionAutomatica: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      pagoObligatorio: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      montoPorTurno: {
        type: Sequelize.DECIMAL(10, 2)
      },
      moneda: {
        type: Sequelize.ENUM('ARS', 'USD'),
        defaultValue: 'ARS'
      },
      pasarelaPago: {
        type: Sequelize.ENUM('mercadopago', 'stripe')
      },
      pagoCredenciales: {
        type: Sequelize.TEXT
      },
      direccion: {
        type: Sequelize.STRING(500)
      },
      linkVideollamada: {
        type: Sequelize.STRING(500)
      },
      planActivo: {
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

    await queryInterface.addIndex('Profesionales', ['slug']);
    await queryInterface.addIndex('Profesionales', ['email']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profesionales');
  }
};
