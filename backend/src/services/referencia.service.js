const { Turno } = require('../models');

const generarReferenciaUnica = async () => {
  let referencia;
  let existe = true;

  while (existe) {
    // Generar string aleatorio de 6 caracteres alfanuméricos mayúsculas
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    referencia = `TRN-${randomStr}`;

    // Verificar en BD
    const turnoExistente = await Turno.findOne({ where: { referencia } });
    if (!turnoExistente) {
      existe = false;
    }
  }

  return referencia;
};

module.exports = {
  generarReferenciaUnica
};
