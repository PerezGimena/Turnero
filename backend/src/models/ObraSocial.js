const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ObraSocial = sequelize.define('ObraSocial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  codigo: {
    type: DataTypes.STRING(50),
  },
  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'ObrasSociales',
  timestamps: true,
});

module.exports = ObraSocial;
