const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConfiguracionDia = sequelize.define('ConfiguracionDia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dia: {
    type: DataTypes.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  horaInicio: {
    type: DataTypes.STRING(5),
  },
  horaFin: {
    type: DataTypes.STRING(5),
  }
}, {
  tableName: 'ConfiguracionDias',
  timestamps: true
});

module.exports = ConfiguracionDia;
