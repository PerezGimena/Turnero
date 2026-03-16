'use strict';

/**
 * Migración: Agrega índices faltantes para optimizar consultas SaaS multi-tenant.
 *
 * Problema detectado: La tabla Pagos no tenía ningún índice manual (solo FKs implícitas).
 * Las consultas "pagos de este profesional" y "pagos por estado" hacían full table scan.
 *
 * Tabla Turnos: faltaba índice en pacienteId para consultas de historial de paciente.
 */
module.exports = {
  async up(queryInterface) {
    // ── PAGOS ─────────────────────────────────────────────────────
    // Consulta: GET /profesional/pagos → WHERE profesionalId = X AND estado IN (...)
    await queryInterface.addIndex('Pagos', ['profesionalId', 'estado'], {
      name: 'idx_pagos_profesional_estado'
    });

    // Consulta: webhook MP/Stripe filtra por pasarela para procesar callbacks
    await queryInterface.addIndex('Pagos', ['pasarela', 'estado'], {
      name: 'idx_pagos_pasarela_estado'
    });

    // Consulta: buscar un pago por transaccionId (ID externo de MP/Stripe)
    await queryInterface.addIndex('Pagos', ['transaccionId'], {
      name: 'idx_pagos_transaccion'
    });

    // ── TURNOS ────────────────────────────────────────────────────
    // Consulta: historial de turnos de un paciente → WHERE pacienteId = X
    await queryInterface.addIndex('Turnos', ['pacienteId'], {
      name: 'idx_turnos_paciente'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Pagos', 'idx_pagos_profesional_estado');
    await queryInterface.removeIndex('Pagos', 'idx_pagos_pasarela_estado');
    await queryInterface.removeIndex('Pagos', 'idx_pagos_transaccion');
    await queryInterface.removeIndex('Turnos', 'idx_turnos_paciente');
  }
};
