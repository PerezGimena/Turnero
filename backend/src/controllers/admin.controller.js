const { Profesional, Turno, ConfiguracionRecordatorios, ConfiguracionDia } = require('../models');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { Op } = require('sequelize');
const { getIntegracionesConfig, invalidarCache, CLAVES } = require('../services/integraciones.service');

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

// PUT /api/admin/profesionales/:id
const updateProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, slug, especialidad, password } = req.body;

    const profesional = await Profesional.findByPk(id);
    if (!profesional) {
      return res.status(404).json({ ok: false, error: 'PROFESIONAL_NO_ENCONTRADO' });
    }

    if (email && email !== profesional.email) {
      const existeEmail = await Profesional.findOne({ where: { email } });
      if (existeEmail) return res.status(409).json({ ok: false, message: 'El email ya está en uso' });
    }
    if (slug && slug !== profesional.slug) {
      const existeSlug = await Profesional.findOne({ where: { slug } });
      if (existeSlug) return res.status(409).json({ ok: false, message: 'El slug ya está en uso' });
    }

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (apellido) updates.apellido = apellido;
    if (email) updates.email = email;
    if (slug) updates.slug = slug;
    if (especialidad !== undefined) updates.especialidad = especialidad;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    await profesional.update(updates);

    const data = profesional.toJSON();
    delete data.passwordHash;

    res.json({ ok: true, data, message: 'Profesional actualizado' });
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

// GET /api/admin/integraciones
const getIntegraciones = async (req, res, next) => {
  try {
    const config = await getIntegracionesConfig();

    // Devolver estado enmascarado (no exponer secretos completos)
    const mascarar = (val) => (val ? `${val.slice(0, 6)}${'*'.repeat(Math.max(0, val.length - 6))}` : null);

    res.json({
      ok: true,
      data: {
        MP_CLIENT_ID:     config.MP_CLIENT_ID     || null,
        MP_CLIENT_SECRET: mascarar(config.MP_CLIENT_SECRET),
        STRIPE_CLIENT_ID: config.STRIPE_CLIENT_ID || null,
        STRIPE_SECRET_KEY: mascarar(config.STRIPE_SECRET_KEY),
        TWILIO_ACCOUNT_SID: config.TWILIO_ACCOUNT_SID || null,
        TWILIO_AUTH_TOKEN: mascarar(config.TWILIO_AUTH_TOKEN),
        TWILIO_WHATSAPP_FROM: config.TWILIO_WHATSAPP_FROM || null,
        // flags de disponibilidad
        mpConfigurado:     !!(config.MP_CLIENT_ID && config.MP_CLIENT_SECRET),
        stripeConfigurado: !!(config.STRIPE_CLIENT_ID && config.STRIPE_SECRET_KEY),
        whatsappConfigurado: !!(
          config.TWILIO_ACCOUNT_SID &&
          config.TWILIO_AUTH_TOKEN &&
          config.TWILIO_WHATSAPP_FROM
        ),
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/integraciones
const saveIntegraciones = async (req, res, next) => {
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ ok: false, message: 'Admin no encontrado' });
    }

    const configActual = admin.configuracion || {};
    const nueva = { ...configActual };

    // Solo actualizar las claves enviadas y no vacías
    for (const clave of CLAVES) {
      if (req.body[clave] !== undefined && req.body[clave] !== '') {
        nueva[clave] = req.body[clave];
      }
    }

    admin.configuracion = nueva;
    admin.changed('configuracion', true); // forzar detección de cambio en columna JSON
    await admin.save();
    invalidarCache();

    res.json({ ok: true, message: 'Credenciales de integraciones guardadas correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfesionales,
  createProfesional,
  updateProfesional,
  updateEstadoProfesional,
  deleteProfesional,
  getMetricasGlobales,
  impersonarProfesional,
  getIntegraciones,
  saveIntegraciones
};
