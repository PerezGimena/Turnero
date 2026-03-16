'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hashSync('Profesional123!', 10);
    
    await queryInterface.bulkInsert('Profesionales', [
      {
        id: 1, 
        slug: 'dr-juan-perez',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@turnosalud.com',
        passwordHash: hashedPassword,
        especialidad: 'Médico Clínico',
        descripcion: 'Especialista en medicina interna con 20 años de experiencia en hospitales públicos y privados.',
        modalidad: 'presencial',
        duracionTurno: 30,
        montoPorTurno: 15000.00,
        moneda: 'ARS',
        aceptaObrasSociales: true,
        obrasSocialesTexto: 'OSDE,Swiss Medical,Galeno',
        confirmacionAutomatica: true,
        pagoObligatorio: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2, 
        slug: 'lic-maria-gonzalez',
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@turnosalud.com',
        passwordHash: hashedPassword,
        especialidad: 'Psicóloga',
        descripcion: 'Psicología clínica, terapia cognitivo-conductual. Enfoque integral para adolescentes y adultos.',
        modalidad: 'ambas',
        duracionTurno: 50,
        montoPorTurno: 20000.00,
        moneda: 'ARS',
        aceptaObrasSociales: false,
        confirmacionAutomatica: false,
        pagoObligatorio: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Profesionales', null, {});
  }
};
