const { Profesional, Turno, ConfiguracionRecordatorios, ConfiguracionDia } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { Op } = require('sequelize');

// GET /api/admin/profesionales
const getProfesionales = async (req, res, next) => {
  try {
    const { busqueda, pagina = 1, porPagina = 20 } = req.query;

    const where = {};
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { email: { [Op.like]: `%${busqueda}%` } },
        { slug: { [Op.like]: `%${busqueda}%` } }
      ];
    }

    const limit = parseInt(porPagina);
    const offset = (parseInt(pagina) - 1) * limit;

    const { count, rows } = await Profesional.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash', 'pagoCredenciales'] }
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

// POST /api/admin/profesionales
const createProfesional = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, slug, especialidad } = req.body;

    // Verificar si ya existe email o slug
    const existeEmail = await Profesional.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(409).json({ ok: false, error: 'EMAIL_DUPLICADO', message: 'El email ya está registrado' });
    }

    const existeSlug = await Profesional.findOne({ where: { slug } });
    if (existeSlug) {
      return res.status(409).json({ ok: false, error: 'SLUG_DUPLICADO', message: 'El slug ya está en uso' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoProfesional = await Profesional.create({
      nombre,
      apellido,
      email,
      passwordHash,
      slug,
      especialidad,
      planActivo: true
    });

    // Crear configuración de recordatorios por defecto
    await ConfiguracionRecordatorios.create({
      profesionalId: nuevoProfesional.id
    });

    // Crear días por defecto (lun-vie 9-17 deshabilitados o habilitados según lógica negocio, aqui vacíos o defaults)
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    for (const dia of dias) {
      await ConfiguracionDia.create({
        profesionalId: nuevoProfesional.id,
        dia,
        habilitado: true,
        horaInicio: '09:00',
        horaFin: '17:00'
      });
    }

    const data = nuevoProfesional.toJSON();
    delete data.passwordHash;

    res.status(201).json({
      ok: true,
      data: data,
      message: 'Profesional creado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/profesionales/:id/estado
const updateEstadoProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planActivo } = req.body; // boolean

    const profesional = await Profesional.findByPk(id);
    if (!profesional) {
      return res.status(404).json({ ok: false, error: 'PROFESIONAL_NO_ENCONTRADO' });
    }

    profesional.planActivo = planActivo;
    await profesional.save();

    res.json({
      ok: true,
      message: `Profesional ${planActivo ? 'activado' : 'suspendido'} correctamente`
    });

  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/profesionales/:id
const deleteProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const profesional = await Profesional.findByPk(id);
    if (!profesional) {
      return res.status(404).json({ ok: false, error: 'PROFESIONAL_NO_ENCONTRADO' });
    }

    // Al borrar profesional, el ON DELETE CASCADE de la BD debería borrar turnos, pacientes, configs, etc.
    await profesional.destroy();

    res.json({
      ok: true,
      message: 'Profesional eliminado correctamente'
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/admin/dashboard/metricas
const getMetricasGlobales = async (req, res, next) => {
  try {
    const totalProfesionales = await Profesional.count();
    const totalTurnos = await Turno.count();
    
    const turnosCompletados = await Turno.count({ where: { estado: 'completado' } });
    const turnosAusentes = await Turno.count({ where: { estado: 'ausente' } });
    
    let tasaAsistencia = 0;
    const totalFinalizados = turnosCompletados + turnosAusentes;
    if (totalFinalizados > 0) {
      tasaAsistencia = (turnosCompletados / totalFinalizados) * 100;
    }

    res.json({
      ok: true,
      data: {
        totalProfesionales,
        totalTurnos,
        tasaAsistencia: parseFloat(tasaAsistencia.toFixed(2))
      }
    });

  } catch (error) {
    next(error);
  }
};

// POST /api/admin/profesionales/:id/impersonar
const impersonarProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const profesional = await Profesional.findByPk(id);
    if (!profesional) {
      return res.status(404).json({ ok: false, error: 'PROFESIONAL_NO_ENCONTRADO' });
    }

    // Generar token como si fuera el profesional
    const payload = {
      sub: profesional.id,
      rol: 'profesional',
      email: profesional.email,
      slug: profesional.slug
    };

    // Token de corta duración para soporte (ej: 1 hora)
    const token = generateToken(payload, '1h');

    res.json({
      ok: true,
      data: {
        token,
        profesional: {
          id: profesional.id,
          nombre: profesional.nombre,
          apellido: profesional.apellido
        }
      },
      message: 'Token de acceso generado. Ya puedes acceder como este profesional.'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfesionales,
  createProfesional,
  updateEstadoProfesional,
  deleteProfesional,
  getMetricasGlobales,
  impersonarProfesional
};
