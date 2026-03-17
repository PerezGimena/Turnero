const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificacionEnvio = sequelize.define('NotificacionEnvio', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pacienteId: {
    type: DataTypes.INTEGER,
  },
  turnoId: {
    type: DataTypes.INTEGER,
  },
  canal: {
    type: DataTypes.ENUM('email', 'whatsapp'),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('confirmacion', 'recordatorio', 'ausencia', 'pendiente_pago', 'otro'),
    allowNull: false,
    defaultValue: 'otro',
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'enviado', 'fallido'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  errorMensaje: {
    type: DataTypes.TEXT,
  },
  enviadoAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'NotificacionesEnvios',
  timestamps: true,
  scopes: {
    porProfesional(profesionalId) {
      return { where: { profesionalId } };
    },
  },
});

module.exports = NotificacionEnvio;
