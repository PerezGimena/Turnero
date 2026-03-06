const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  turnoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  moneda: {
    type: DataTypes.ENUM('ARS', 'USD'),
    defaultValue: 'ARS'
  },
  pasarela: {
    type: DataTypes.ENUM('mercadopago', 'stripe'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'reembolsado'),
    defaultValue: 'pendiente'
  },
  transaccionId: {
    type: DataTypes.STRING(255),
  }
}, {
  tableName: 'Pagos',
  timestamps: true
});

module.exports = Pago;
