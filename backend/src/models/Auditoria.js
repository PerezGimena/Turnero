const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  actorTipo: {
    type: DataTypes.ENUM('admin', 'profesional', 'sistema'),
    allowNull: false,
    defaultValue: 'sistema',
  },
  actorId: {
    type: DataTypes.INTEGER,
  },
  entidad: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  entidadId: {
    type: DataTypes.INTEGER,
  },
  accion: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  cambiosAntes: {
    type: DataTypes.JSON,
  },
  cambiosDespues: {
    type: DataTypes.JSON,
  },
  metadata: {
    type: DataTypes.JSON,
  },
}, {
  tableName: 'Auditorias',
  timestamps: true,
});

module.exports = Auditoria;
