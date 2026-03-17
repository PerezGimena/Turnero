const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OAuthConnection = sequelize.define('OAuthConnection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.ENUM('mercadopago', 'stripe'),
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  providerUserId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  providerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  publishableKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('conectado', 'desconectado', 'error'),
    allowNull: false,
    defaultValue: 'conectado',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'OAuthConnections',
  timestamps: true,
});

module.exports = OAuthConnection;
