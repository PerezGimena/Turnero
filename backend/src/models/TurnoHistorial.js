const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TurnoHistorial = sequelize.define('TurnoHistorial', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  turnoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estadoAnterior: {
    type: DataTypes.ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado'),
  },
  estadoNuevo: {
    type: DataTypes.ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado'),
    allowNull: false,
  },
  motivo: {
    type: DataTypes.TEXT,
  },
  actorTipo: {
    type: DataTypes.ENUM('admin', 'profesional', 'sistema'),
    allowNull: false,
    defaultValue: 'sistema',
  },
  actorId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'TurnoHistoriales',
  timestamps: true,
});

module.exports = TurnoHistorial;
