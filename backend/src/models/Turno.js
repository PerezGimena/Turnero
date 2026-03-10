const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turno = sequelize.define('Turno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referencia: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY porque la hora está separada
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  horaFin: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  duracion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modalidad: {
    type: DataTypes.ENUM('presencial', 'virtual', 'ambas'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado'),
    defaultValue: 'pendiente'
  },
  motivoConsulta: {
    type: DataTypes.TEXT,
  },
  motivoCancelacion: {
    type: DataTypes.TEXT,
  },
  pagoId: {
    type: DataTypes.INTEGER,
  },
  creadoManualmente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'Turnos',
  timestamps: true
});

module.exports = Turno;
