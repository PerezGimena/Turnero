const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfiguracionRecordatorios = sequelize.define('ConfiguracionRecordatorios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  emailHabilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  whatsappHabilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  whatsappNumero: {
    type: DataTypes.STRING(30),
  },
  recordatorio1Habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  recordatorio1HorasAntes: {
    type: DataTypes.INTEGER,
    defaultValue: 24
  },
  recordatorio2Habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recordatorio2HorasAntes: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  recordatorio3Habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recordatorio3HorasAntes: {
    type: DataTypes.INTEGER,
  },
  mensajeEmail: {
    type: DataTypes.TEXT,
  },
  mensajeWhatsapp: {
    type: DataTypes.TEXT,
  },
  recordatorioAusencia: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mensajeAusencia: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'ConfiguracionRecordatorios',
  timestamps: true
});

module.exports = ConfiguracionRecordatorios;
