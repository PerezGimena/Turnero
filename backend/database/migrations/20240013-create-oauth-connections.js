'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OAuthConnections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profesionales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      provider: {
        type: Sequelize.ENUM('mercadopago', 'stripe'),
        allowNull: false,
      },
      accessToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      providerUserId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      providerEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      publishableKey: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('conectado', 'desconectado', 'error'),
        allowNull: false,
        defaultValue: 'conectado',
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('OAuthConnections', ['profesionalId', 'provider'], {
      unique: true,
      name: 'uq_oauthconnections_profesional_provider',
    });

    await queryInterface.addIndex('OAuthConnections', ['provider', 'status'], {
      name: 'idx_oauthconnections_provider_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('OAuthConnections', 'idx_oauthconnections_provider_status');
    await queryInterface.removeIndex('OAuthConnections', 'uq_oauthconnections_profesional_provider');
    await queryInterface.dropTable('OAuthConnections');
  },
};
