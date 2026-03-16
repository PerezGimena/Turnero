const { Pago, Paciente, Turno } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getPagos = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { pagina = 1, porPagina = 20, estado, fechaDesde, fechaHasta } = req.query;

    const limit = parseInt(porPagina);
    const offset = (parseInt(pagina) - 1) * limit;

    const where = { profesionalId };

    if (estado) {
      where.estado = estado;
    }

    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        // Asumiendo formato YYYY-MM-DD o ISO
        const dateDesde = new Date(fechaDesde);
        if (!isNaN(dateDesde.getTime())) {
            where.createdAt[Op.gte] = dateDesde;
        }
      }
      if (fechaHasta) {
        const dateHasta = new Date(fechaHasta);
        if (!isNaN(dateHasta.getTime())) {
            // Ajustar al final del día si solo viene la fecha
            if (fechaHasta.length <= 10) {
                dateHasta.setHours(23, 59, 59, 999);
            }
            where.createdAt[Op.lte] = dateHasta;
        }
      }
    }

    const { count, rows } = await Pago.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Paciente,
          attributes: ['nombre', 'apellido']
        },
        {
          model: Turno,
          attributes: ['referencia']
        }
      ]
    });

    res.json({
      ok: true,
      data: rows,
      pagination: {
        total: count,
        pagina: parseInt(pagina),
        porPagina: limit,
        totalPaginas: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

const getMetricasPagos = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const now = new Date();
    
    // Mes Actual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Mes Anterior
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Total recaudado mes actual (estado 'aprobado')
    const totalMesActual = await Pago.sum('monto', {
      where: {
        profesionalId,
        estado: 'aprobado',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    // 2. Total recaudado mes anterior (estado 'aprobado')
    const totalMesAnterior = await Pago.sum('monto', {
      where: {
        profesionalId,
        estado: 'aprobado',
        createdAt: {
          [Op.between]: [startOfPrevMonth, endOfPrevMonth]
        }
      }
    });

    // 3. Cantidad pagos aprobados mes actual
    const cantidadAprobadosMes = await Pago.count({
      where: {
        profesionalId,
        estado: 'aprobado',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    // 4. Cantidad pagos pendientes (Total histórico acumulado)
    const cantidadPendientesTotal = await Pago.count({
      where: {
        profesionalId,
        estado: 'pendiente'
      }
    });

    res.json({
      ok: true,
      data: {
        totalMesActual: totalMesActual || 0,
        totalMesAnterior: totalMesAnterior || 0,
        cantidadAprobadosMes: cantidadAprobadosMes || 0,
        cantidadPendientes: cantidadPendientesTotal || 0
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPagos,
  getMetricasPagos
};
