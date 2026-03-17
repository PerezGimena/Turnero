const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfesionalObraSocial = sequelize.define('ProfesionalObraSocial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  obraSocialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'ProfesionalObrasSociales',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['profesionalId', 'obraSocialId'] },
  ],
});

module.exports = ProfesionalObraSocial;
