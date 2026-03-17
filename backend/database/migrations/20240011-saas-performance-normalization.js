'use strict';

/**
 * Optimización SaaS:
 * 1) Tablas faltantes para normalización, auditoría e historial.
 * 2) Índices compuestos para consultas frecuentes en listados y filtros por fecha.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ============================
    // TABLAS NUEVAS
    // ============================

    await queryInterface.createTable('ObrasSociales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      activa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('ProfesionalObrasSociales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profesionales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      obraSocialId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ObrasSociales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('TurnoHistoriales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      turnoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Turnos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estadoAnterior: {
        type: Sequelize.ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado'),
        allowNull: true,
      },
      estadoNuevo: {
        type: Sequelize.ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado'),
        allowNull: false,
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      actorTipo: {
        type: Sequelize.ENUM('admin', 'profesional', 'sistema'),
        allowNull: false,
        defaultValue: 'sistema',
      },
      actorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('Auditorias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      actorTipo: {
        type: Sequelize.ENUM('admin', 'profesional', 'sistema'),
        allowNull: false,
        defaultValue: 'sistema',
      },
      actorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      entidad: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      entidadId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      accion: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      cambiosAntes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      cambiosDespues: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('ExcepcionesAgenda', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profesionales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      horaInicio: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      horaFin: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM('bloqueo', 'sobreturno', 'feriado'),
        allowNull: false,
        defaultValue: 'bloqueo',
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('NotificacionesEnvios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      profesionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profesionales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Pacientes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      turnoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Turnos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      canal: {
        type: Sequelize.ENUM('email', 'whatsapp'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('confirmacion', 'recordatorio', 'ausencia', 'pendiente_pago', 'otro'),
        allowNull: false,
        defaultValue: 'otro',
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'enviado', 'fallido'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      errorMensaje: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      enviadoAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ============================
    // ÍNDICES Y CONSTRAINTS
    // ============================

    await queryInterface.addConstraint('ProfesionalObrasSociales', {
      fields: ['profesionalId', 'obraSocialId'],
      type: 'unique',
      name: 'uq_profesional_obra_social',
    });

    await queryInterface.addIndex('ProfesionalObrasSociales', ['profesionalId'], {
      name: 'idx_pos_profesional',
    });
    await queryInterface.addIndex('ProfesionalObrasSociales', ['obraSocialId'], {
      name: 'idx_pos_obra_social',
    });

    await queryInterface.addIndex('TurnoHistoriales', ['turnoId', 'createdAt'], {
      name: 'idx_turno_historial_turno_fecha',
    });
    await queryInterface.addIndex('TurnoHistoriales', ['estadoNuevo', 'createdAt'], {
      name: 'idx_turno_historial_estado_fecha',
    });

    await queryInterface.addIndex('Auditorias', ['entidad', 'entidadId', 'createdAt'], {
      name: 'idx_auditoria_entidad_fecha',
    });
    await queryInterface.addIndex('Auditorias', ['actorTipo', 'actorId', 'createdAt'], {
      name: 'idx_auditoria_actor_fecha',
    });

    await queryInterface.addIndex('ExcepcionesAgenda', ['profesionalId', 'fecha', 'tipo'], {
      name: 'idx_excepciones_agenda_prof_fecha_tipo',
    });

    await queryInterface.addIndex('NotificacionesEnvios', ['profesionalId', 'createdAt'], {
      name: 'idx_notif_prof_fecha',
    });
    await queryInterface.addIndex('NotificacionesEnvios', ['turnoId', 'canal'], {
      name: 'idx_notif_turno_canal',
    });
    await queryInterface.addIndex('NotificacionesEnvios', ['estado', 'createdAt'], {
      name: 'idx_notif_estado_fecha',
    });

    // Índices de performance en tablas existentes
    await queryInterface.addIndex('ConfiguracionDias', ['profesionalId', 'dia'], {
      name: 'idx_config_dias_profesional_dia',
    });

    await queryInterface.addIndex('Pacientes', ['profesionalId', 'apellido', 'nombre'], {
      name: 'idx_pacientes_prof_apellido_nombre',
    });
    await queryInterface.addIndex('Pacientes', ['profesionalId', 'createdAt'], {
      name: 'idx_pacientes_prof_created',
    });

    await queryInterface.addIndex('Turnos', ['profesionalId', 'estado', 'fecha', 'horaInicio'], {
      name: 'idx_turnos_prof_estado_fecha_hora',
    });
    await queryInterface.addIndex('Turnos', ['profesionalId', 'fecha', 'horaInicio'], {
      name: 'idx_turnos_prof_fecha_hora',
    });
    await queryInterface.addIndex('Turnos', ['pacienteId', 'fecha'], {
      name: 'idx_turnos_paciente_fecha',
    });

    await queryInterface.addIndex('Pagos', ['profesionalId', 'createdAt'], {
      name: 'idx_pagos_prof_created',
    });
    await queryInterface.addIndex('Pagos', ['estado', 'createdAt'], {
      name: 'idx_pagos_estado_created',
    });

    await queryInterface.addIndex('Profesionales', ['planActivo', 'createdAt'], {
      name: 'idx_profesionales_plan_created',
    });
    await queryInterface.addIndex('Profesionales', ['especialidad', 'planActivo'], {
      name: 'idx_profesionales_especialidad_plan',
    });
  },

  async down(queryInterface) {
    // Índices existentes
    await queryInterface.removeIndex('Profesionales', 'idx_profesionales_especialidad_plan');
    await queryInterface.removeIndex('Profesionales', 'idx_profesionales_plan_created');
    await queryInterface.removeIndex('Pagos', 'idx_pagos_estado_created');
    await queryInterface.removeIndex('Pagos', 'idx_pagos_prof_created');
    await queryInterface.removeIndex('Turnos', 'idx_turnos_paciente_fecha');
    await queryInterface.removeIndex('Turnos', 'idx_turnos_prof_fecha_hora');
    await queryInterface.removeIndex('Turnos', 'idx_turnos_prof_estado_fecha_hora');
    await queryInterface.removeIndex('Pacientes', 'idx_pacientes_prof_created');
    await queryInterface.removeIndex('Pacientes', 'idx_pacientes_prof_apellido_nombre');
    await queryInterface.removeIndex('ConfiguracionDias', 'idx_config_dias_profesional_dia');

    // Índices tablas nuevas
    await queryInterface.removeIndex('NotificacionesEnvios', 'idx_notif_estado_fecha');
    await queryInterface.removeIndex('NotificacionesEnvios', 'idx_notif_turno_canal');
    await queryInterface.removeIndex('NotificacionesEnvios', 'idx_notif_prof_fecha');
    await queryInterface.removeIndex('ExcepcionesAgenda', 'idx_excepciones_agenda_prof_fecha_tipo');
    await queryInterface.removeIndex('Auditorias', 'idx_auditoria_actor_fecha');
    await queryInterface.removeIndex('Auditorias', 'idx_auditoria_entidad_fecha');
    await queryInterface.removeIndex('TurnoHistoriales', 'idx_turno_historial_estado_fecha');
    await queryInterface.removeIndex('TurnoHistoriales', 'idx_turno_historial_turno_fecha');
    await queryInterface.removeIndex('ProfesionalObrasSociales', 'idx_pos_obra_social');
    await queryInterface.removeIndex('ProfesionalObrasSociales', 'idx_pos_profesional');

    await queryInterface.removeConstraint('ProfesionalObrasSociales', 'uq_profesional_obra_social');

    // Tablas nuevas
    await queryInterface.dropTable('NotificacionesEnvios');
    await queryInterface.dropTable('ExcepcionesAgenda');
    await queryInterface.dropTable('Auditorias');
    await queryInterface.dropTable('TurnoHistoriales');
    await queryInterface.dropTable('ProfesionalObrasSociales');
    await queryInterface.dropTable('ObrasSociales');
  },
};
