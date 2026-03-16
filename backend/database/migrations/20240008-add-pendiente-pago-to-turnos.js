'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Turnos
      MODIFY COLUMN estado
        ENUM('pendiente', 'pendiente_pago', 'confirmado', 'cancelado', 'ausente', 'completado')
        NOT NULL DEFAULT 'pendiente'
    `);
  },

  async down(queryInterface) {
    // Revertir: actualizar filas con 'pendiente_pago' antes de quitar el valor del ENUM
    await queryInterface.sequelize.query(`
      UPDATE Turnos SET estado = 'pendiente' WHERE estado = 'pendiente_pago'
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE Turnos
      MODIFY COLUMN estado
        ENUM('pendiente', 'confirmado', 'cancelado', 'ausente', 'completado')
        NOT NULL DEFAULT 'pendiente'
    `);
  },
};
