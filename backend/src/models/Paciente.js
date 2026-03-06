const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paciente = sequelize.define('Paciente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  dni: {
    type: DataTypes.STRING(20),
  },
  tieneObraSocial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  obraSocial: {
    type: DataTypes.STRING(200),
  },
  numeroAfiliado: {
    type: DataTypes.STRING(100),
  },
  aceptaRecordatorios: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Pacientes',
  timestamps: true
});

module.exports = Paciente;
