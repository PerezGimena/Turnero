const sequelize = require('../config/database');

const Admin = require('./Admin');
const Profesional = require('./Profesional');
const ConfiguracionDia = require('./ConfiguracionDia');
const Paciente = require('./Paciente');
const Turno = require('./Turno');
const Pago = require('./Pago');
const ConfiguracionRecordatorios = require('./ConfiguracionRecordatorios');

// Definir asociaciones

// Profesional -> ConfiguracionDia (1:N)
Profesional.hasMany(ConfiguracionDia, { foreignKey: 'profesionalId', as: 'diasConfiguracion' });
ConfiguracionDia.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Profesional -> ConfiguracionRecordatorios (1:1)
Profesional.hasOne(ConfiguracionRecordatorios, { foreignKey: 'profesionalId', as: 'recordatorios' });
ConfiguracionRecordatorios.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Profesional -> Paciente (1:N)
Profesional.hasMany(Paciente, { foreignKey: 'profesionalId', as: 'pacientes' });
Paciente.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Profesional -> Turno (1:N)
Profesional.hasMany(Turno, { foreignKey: 'profesionalId', as: 'turnos' });
Turno.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' });

// Profesional -> Pago (1:N)
Profesional.hasMany(Pago, { foreignKey: 'profesionalId', as: 'pagos' });
Pago.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Paciente -> Turno (1:N)
Paciente.hasMany(Turno, { foreignKey: 'pacienteId', as: 'turnos' });
Turno.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

// Paciente -> Pago (1:N)
Paciente.hasMany(Pago, { foreignKey: 'pacienteId', as: 'pagos' });
Pago.belongsTo(Paciente, { foreignKey: 'pacienteId' });

// Turno -> Pago (1:1) - Un turno puede tener un pago asociado
Turno.hasOne(Pago, { foreignKey: 'turnoId', as: 'pago' });
Pago.belongsTo(Turno, { foreignKey: 'turnoId' });

module.exports = {
  sequelize,
  Admin,
  Profesional,
  ConfiguracionDia,
  Paciente,
  Turno,
  Pago,
  ConfiguracionRecordatorios
};
