const sequelize = require('../config/database');

const Admin = require('./Admin');
const Profesional = require('./Profesional');
const ConfiguracionDia = require('./ConfiguracionDia');
const Paciente = require('./Paciente');
const Turno = require('./Turno');
const Pago = require('./Pago');
const ConfiguracionRecordatorios = require('./ConfiguracionRecordatorios');
const ObraSocial = require('./ObraSocial');
const ProfesionalObraSocial = require('./ProfesionalObraSocial');
const TurnoHistorial = require('./TurnoHistorial');
const Auditoria = require('./Auditoria');
const ExcepcionAgenda = require('./ExcepcionAgenda');
const NotificacionEnvio = require('./NotificacionEnvio');
const OAuthConnection = require('./OAuthConnection');

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

// Profesional <-> ObraSocial (N:N) vía tabla pivote
Profesional.belongsToMany(ObraSocial, {
  through: ProfesionalObraSocial,
  foreignKey: 'profesionalId',
  otherKey: 'obraSocialId',
  as: 'obrasSociales',
});
ObraSocial.belongsToMany(Profesional, {
  through: ProfesionalObraSocial,
  foreignKey: 'obraSocialId',
  otherKey: 'profesionalId',
  as: 'profesionales',
});

Profesional.hasMany(ProfesionalObraSocial, { foreignKey: 'profesionalId', as: 'profesionalObrasSociales' });
ProfesionalObraSocial.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' });
ObraSocial.hasMany(ProfesionalObraSocial, { foreignKey: 'obraSocialId', as: 'profesionalesObraSocial' });
ProfesionalObraSocial.belongsTo(ObraSocial, { foreignKey: 'obraSocialId', as: 'obraSocial' });

// Turno -> TurnoHistorial (1:N)
Turno.hasMany(TurnoHistorial, { foreignKey: 'turnoId', as: 'historial' });
TurnoHistorial.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });

// Profesional -> ExcepcionAgenda (1:N)
Profesional.hasMany(ExcepcionAgenda, { foreignKey: 'profesionalId', as: 'excepcionesAgenda' });
ExcepcionAgenda.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' });

// Profesional/Paciente/Turno -> NotificacionEnvio
Profesional.hasMany(NotificacionEnvio, { foreignKey: 'profesionalId', as: 'notificacionesEnvios' });
NotificacionEnvio.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' });

Paciente.hasMany(NotificacionEnvio, { foreignKey: 'pacienteId', as: 'notificacionesEnvios' });
NotificacionEnvio.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Turno.hasMany(NotificacionEnvio, { foreignKey: 'turnoId', as: 'notificacionesEnvios' });
NotificacionEnvio.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });

// Profesional -> OAuthConnection (1:N)
Profesional.hasMany(OAuthConnection, { foreignKey: 'profesionalId', as: 'oauthConnections' });
OAuthConnection.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' });

module.exports = {
  sequelize,
  Admin,
  Profesional,
  ConfiguracionDia,
  Paciente,
  Turno,
  Pago,
  ConfiguracionRecordatorios,
  ObraSocial,
  ProfesionalObraSocial,
  TurnoHistorial,
  Auditoria,
  ExcepcionAgenda,
  NotificacionEnvio,
  OAuthConnection,
};
