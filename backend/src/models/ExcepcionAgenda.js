const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExcepcionAgenda = sequelize.define('ExcepcionAgenda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  horaInicio: {
    type: DataTypes.STRING(5),
  },
  horaFin: {
    type: DataTypes.STRING(5),
  },
  tipo: {
    type: DataTypes.ENUM('bloqueo', 'sobreturno', 'feriado'),
    allowNull: false,
    defaultValue: 'bloqueo',
  },
  motivo: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'ExcepcionesAgenda',
  timestamps: true,
  scopes: {
    porProfesional(profesionalId) {
      return { where: { profesionalId } };
    },
  },
});

module.exports = ExcepcionAgenda;
