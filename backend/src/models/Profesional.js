const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profesional = sequelize.define('Profesional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
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
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  especialidad: {
    type: DataTypes.STRING(150),
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  fotoPerfil: {
    type: DataTypes.STRING(500),
  },
  modalidad: {
    type: DataTypes.ENUM('presencial', 'virtual', 'ambas'),
    defaultValue: 'presencial'
  },
  aceptaObrasSociales: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  obrasSocialesTexto: {
    type: DataTypes.TEXT,
  },
  duracionTurno: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  tiempoDescanso: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  confirmacionAutomatica: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pagoObligatorio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  montoPorTurno: {
    type: DataTypes.DECIMAL(10, 2),
  },
  moneda: {
    type: DataTypes.ENUM('ARS', 'USD'),
    defaultValue: 'ARS'
  },
  pasarelaPago: {
    type: DataTypes.ENUM('mercadopago', 'stripe'),
  },
  pagoCredenciales: {
    type: DataTypes.TEXT,
  },
  direccion: {
    type: DataTypes.STRING(500),
  },
  linkVideollamada: {
    type: DataTypes.STRING(500),
  },
  planActivo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Profesionales',
  timestamps: true
});

module.exports = Profesional;
