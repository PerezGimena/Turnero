const {
  Turno,
  Paciente,
  Profesional,
  ConfiguracionDia,
  Pago,
} = require("../models");
const { Op } = require("sequelize");
const {
  crearReserva: crearReservaService,
} = require("../services/turno.service");
const {
  calcularSlotsDisponibles,
} = require("../services/disponibilidad.service");
const {
  getConnection,
  upsertConnection,
  disconnectByProfesional,
} = require('../services/oauthConnection.service');

const ESTADOS_ACTIVOS_TURNO = ["pendiente", "pendiente_pago", "confirmado"];

const _toDateOnly = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const _getRangeFromQuery = (fechaDesde, fechaHasta, diasDefault = 14) => {
  const hoy = new Date();
  const porDefectoDesde = _toDateOnly(hoy);

  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + diasDefault);
  const porDefectoHasta = _toDateOnly(limite);

  return {
    fechaDesde: fechaDesde || porDefectoDesde,
    fechaHasta: fechaHasta || porDefectoHasta,
  };
};

// --- TURNOS ---

const getTurnos = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const {
      fecha,
      estado,
      busqueda,
      fechaDesde,
      fechaHasta,
      pagina = 1,
      porPagina,
      limit,
      incluirPasados = "false",
    } = req.query;

    const where = { profesionalId };
    if (fecha) {
      where.fecha = fecha;
    } else {
      const range = _getRangeFromQuery(fechaDesde, fechaHasta, 14);
      where.fecha = {
        [Op.between]: [range.fechaDesde, range.fechaHasta],
      };

      if (incluirPasados === "true") {
        delete where.fecha;
      }
    }

    if (estado) where.estado = estado;

    const pageSizeInput = porPagina || limit || 20;
    const pageSize = Math.min(Math.max(parseInt(pageSizeInput, 10) || 20, 1), 100);
    const paginaNum = Math.max(parseInt(pagina, 10) || 1, 1);
    const offset = (paginaNum - 1) * pageSize;

    const includePaciente = {
      model: Paciente,
      as: "paciente",
      attributes: ["id", "nombre", "apellido", "email"],
    };

    if (busqueda) {
      includePaciente.where = {
        [Op.or]: [
          { nombre: { [Op.like]: `%${busqueda}%` } },
          { apellido: { [Op.like]: `%${busqueda}%` } },
          { email: { [Op.like]: `%${busqueda}%` } },
        ],
      };
      includePaciente.required = true;
    }

    const { count, rows } = await Turno.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [
        ["fecha", "ASC"],
        ["horaInicio", "ASC"],
      ],
      include: [includePaciente],
    });

    res.json({
      ok: true,
      data: rows,
      pagination: {
        total: count,
        pagina: paginaNum,
        porPagina: pageSize,
        totalPaginas: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTurnoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;

    const turno = await Turno.findOne({
      where: { id, profesionalId },
      include: [
        { model: Paciente, as: "paciente" },
        { model: Pago, as: "pago" },
      ],
    });

    if (!turno) {
      return res.status(404).json({
        ok: false,
        error: "TURNO_NO_ENCONTRADO",
        message: "Turno no encontrado",
      });
    }

    res.json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
};

const crearTurnoManual = async (req, res, next) => {
  try {
    const profesionalSlug = req.user.slug;
    const datosReserva = { ...req.body, creadoManualmente: true };
    const resultado = await crearReservaService(profesionalSlug, datosReserva);

    const turnoActualizado = await Turno.findByPk(resultado.turno.id);
    turnoActualizado.creadoManualmente = true;
    turnoActualizado.estado = "confirmado";
    await turnoActualizado.save();

    res.status(201).json({
      ok: true,
      data: { ...resultado, turno: turnoActualizado },
      message: "Turno manual creado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

const confirmarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;

    const turno = await Turno.findOne({ where: { id, profesionalId } });
    if (!turno)
      return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    if (turno.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        error: "ESTADO_INVALIDO",
        message: "El turno no está pendiente",
      });
    }

    turno.estado = "confirmado";
    await turno.save();

    res.json({ ok: true, data: turno, message: "Turno confirmado" });
  } catch (error) {
    next(error);
  }
};

const rechazarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;
    const { motivo } = req.body;

    const turno = await Turno.findOne({ where: { id, profesionalId } });
    if (!turno)
      return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    turno.estado = "cancelado";
    turno.motivoCancelacion = motivo;
    await turno.save();

    res.json({ ok: true, data: turno, message: "Turno rechazado/cancelado" });
  } catch (error) {
    next(error);
  }
};

const marcarAusente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;

    const turno = await Turno.findOne({ where: { id, profesionalId } });
    if (!turno)
      return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    // Se puede marcar ausente si estaba confirmado
    if (turno.estado !== "confirmado") {
      return res.status(400).json({
         ok: false, 
         error: "ESTADO_INVALIDO", 
         message: "Solo se puede marcar ausente un turno confirmado" 
      });
    }

    turno.estado = "ausente";
    await turno.save();

    res.json({ ok: true, data: turno, message: "Turno marcado como ausente" });
  } catch (error) {
    next(error);
  }
};

const cancelarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;
    const { motivo } = req.body;

    const turno = await Turno.findOne({ where: { id, profesionalId } });
    if (!turno)
      return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    turno.estado = "cancelado";
    turno.motivoCancelacion = motivo;
    await turno.save();

    res.json({ ok: true, data: turno, message: "Turno cancelado" });
  } catch (error) {
    next(error);
  }
};

const reprogramarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;
    const { fecha, horaInicio, horaFin } = req.body;

    const turno = await Turno.findOne({ where: { id, profesionalId } });
    if (!turno)
      return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    // Verificar disponibilidad del nuevo slot
    const colision = await Turno.findOne({
      where: {
        profesionalId,
        fecha,
        estado: { [Op.in]: ["pendiente", "confirmado"] },
        id: { [Op.ne]: id }, // Excluir el mismo turno
        [Op.or]: [
            // Lógica de superposición de intervalos
            {
                horaInicio: { [Op.lt]: horaFin },
                horaFin: { [Op.gt]: horaInicio }
            }
        ]
      }
    });

    if (colision) {
      return res.status(400).json({
        ok: false,
        error: "SLOT_OCUPADO",
        message: "El horario seleccionado ya está ocupado por otro turno."
      });
    }

    turno.fecha = fecha;
    turno.horaInicio = horaInicio;
    turno.horaFin = horaFin;
    // Forzamos confirmación al reprogramar
    turno.estado = "confirmado"; 
    
    await turno.save();

    res.json({ ok: true, data: turno, message: "Turno reprogramado exitosamente" });
  } catch (error) {
    next(error);
  }
};

// --- PACIENTES ---

const getPacientes = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const {
      busqueda,
      fechaDesde,
      fechaHasta,
      scope = "proximos",
      pagina = 1,
      porPagina = 20,
    } = req.query;

    const where = { profesionalId };
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { email: { [Op.like]: `%${busqueda}%` } },
        { dni: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(porPagina, 10) || 20, 1), 100);
    const paginaNum = Math.max(parseInt(pagina, 10) || 1, 1);
    const offset = (paginaNum - 1) * limit;

    const include = [];
    const rango = _getRangeFromQuery(fechaDesde, fechaHasta, 14);

    if (scope !== "todos") {
      const whereTurno = {
        profesionalId,
      };

      if (scope === "pasados") {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        whereTurno.fecha = {
          [Op.between]: [
            fechaDesde || _toDateOnly(new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate() - 30)),
            fechaHasta || _toDateOnly(ayer),
          ],
        };
      } else {
        whereTurno.fecha = {
          [Op.between]: [rango.fechaDesde, rango.fechaHasta],
        };
        whereTurno.estado = { [Op.in]: ESTADOS_ACTIVOS_TURNO };
      }

      include.push({
        model: Turno,
        as: "turnos",
        attributes: [],
        where: whereTurno,
        required: true,
      });
    }

    const { count, rows } = await Paciente.findAndCountAll({
      where,
      include,
      distinct: true,
      subQuery: false,
      limit,
      offset,
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    res.json({
      ok: true,
      data: rows,
      pagination: {
        total: count,
        pagina: paginaNum,
        porPagina: limit,
        totalPaginas: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPacienteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user.sub;

    const paciente = await Paciente.findOne({
      where: { id, profesionalId },
      include: [
        {
          model: Turno,
          as: "turnos",
          limit: 10,
          order: [["fecha", "DESC"]],
        },
      ],
    });

    if (!paciente)
      return res
        .status(404)
        .json({ ok: false, error: "PACIENTE_NO_ENCONTRADO" });

    res.json({ ok: true, data: paciente });
  } catch (error) {
    next(error);
  }
};

const crearPacienteManual = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { nombre, apellido, email, telefono, dni, obraSocial, numeroAfiliado } = req.body;

    // Verificar existencia por email y profesional
    const existente = await Paciente.findOne({
      where: { profesionalId, email }
    });

    if (existente) {
      return res.status(400).json({
        ok: false,
        error: "PACIENTE_EXISTENTE",
        message: "Ya existe un paciente con ese email para este profesional."
      });
    }

    const nuevoPaciente = await Paciente.create({
      profesionalId,
      nombre,
      apellido,
      email,
      telefono,
      dni,
      obraSocial,
      numeroAfiliado,
      tieneObraSocial: !!obraSocial // Si viene obra social, true
    });

    res.status(201).json({
      ok: true,
      data: nuevoPaciente,
      message: "Paciente creado manualmente"
    });
  } catch (error) {
    next(error);
  }
};

// --- PERFIL ---

const getPerfil = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const profesional = await Profesional.findByPk(profesionalId, {
      attributes: { exclude: ["passwordHash", "pagoCredenciales"] },
      include: [{ model: ConfiguracionDia, as: "diasConfiguracion" }],
    });

    if (!profesional) {
      return res
        .status(404)
        .json({ ok: false, error: "PROFESIONAL_NO_ENCONTRADO" });
    }

    const data = profesional.toJSON();

    // String → Array
    data.obrasSociales = data.obrasSocialesTexto
      ? data.obrasSocialesTexto
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // ENUM → frontend
    const modalidadMap = {
      presencial: "Presencial",
      virtual: "Virtual",
      ambas: "Presencial y Virtual",
    };
    data.modalidad = modalidadMap[data.modalidad] || data.modalidad;

    // 0/1 → boolean
    data.confirmacionAutomatica = Boolean(data.confirmacionAutomatica);
    data.aceptaObrasSociales = Boolean(data.aceptaObrasSociales);
    data.pagoObligatorio = Boolean(data.pagoObligatorio);

    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

const updatePerfil = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const updates = { ...req.body };

    // Campos protegidos
    delete updates.id;
    delete updates.passwordHash;
    delete updates.email;
    delete updates.slug;
    delete updates.diasConfiguracion;

    // Array → string
    if (updates.obrasSociales !== undefined) {
      updates.obrasSocialesTexto = Array.isArray(updates.obrasSociales)
        ? updates.obrasSociales.join(",")
        : "";
      delete updates.obrasSociales;
    }

    // Frontend → ENUM
    if (updates.modalidad) {
      const modalidadMap = {
        Presencial: "presencial",
        Virtual: "virtual",
        "Presencial y Virtual": "ambas",
      };
      updates.modalidad =
        modalidadMap[updates.modalidad] || updates.modalidad.toLowerCase();
    }

    // boolean → 0/1 para MySQL
    if (updates.confirmacionAutomatica !== undefined) {
      updates.confirmacionAutomatica = updates.confirmacionAutomatica ? 1 : 0;
    }
    if (updates.aceptaObrasSociales !== undefined) {
      updates.aceptaObrasSociales = updates.aceptaObrasSociales ? 1 : 0;
    }
    if (updates.pagoObligatorio !== undefined) {
      updates.pagoObligatorio = updates.pagoObligatorio ? 1 : 0;
    }

    await Profesional.update(updates, { where: { id: profesionalId } });

    // Actualizar días
    const diasConfiguracion = req.body.diasConfiguracion;
    if (Array.isArray(diasConfiguracion)) {
      for (const diaConfig of diasConfiguracion) {
        await ConfiguracionDia.update(
          {
            habilitado: diaConfig.habilitado,
            horaInicio: diaConfig.horaInicio,
            horaFin: diaConfig.horaFin,
          },
          { where: { profesionalId, dia: diaConfig.dia } },
        );
      }
    }

    res.json({ ok: true, message: "Perfil actualizado correctamente" });
  } catch (error) {
    next(error);
  }
};

// --- DASHBOARD ---

const getMetricasDashboard = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const now = new Date();
    const hoy = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Rango del mes actual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Rango de hoy para timestamps (Pagos y Pacientes usan createdAt)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Turnos Hoy
    const turnosHoy = await Turno.count({
      where: { profesionalId, fecha: hoy, estado: { [Op.not]: "cancelado" } },
    });

    // 2. Pendientes Totales
    const pendientes = await Turno.count({
      where: { profesionalId, estado: "pendiente" },
    });

    // 3. Turnos del Mes (excluyendo cancelados)
    // Turno.fecha es string YYYY-MM-DD o DATEONLY
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

    const turnosMes = await Turno.count({
      where: {
        profesionalId,
        fecha: {
             [Op.between]: [startOfMonthStr, endOfMonthStr]
        },
        estado: { [Op.not]: "cancelado" }
      }
    });

    // 4. Pacientes Nuevos este Mes
    const pacientesNuevosMes = await Paciente.count({
      where: {
        profesionalId,
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    // 5. Ingresos este Mes
    const ingresosMes = await Pago.sum('monto', {
      where: {
        profesionalId,
        estado: 'aprobado',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    // 6. Ingresos Hoy
    const ingresosHoy = await Pago.sum('monto', {
        where: {
          profesionalId,
          estado: 'aprobado',
          createdAt: {
            [Op.between]: [startOfToday, endOfToday]
          }
        }
    });

    res.json({ 
        ok: true, 
        data: { 
            turnosHoy, 
            pendientes,
            turnosMes,
            pacientesNuevosMes,
            ingresosMes: ingresosMes || 0,
            ingresosHoy: ingresosHoy || 0
        } 
    });
  } catch (error) {
    next(error);
  }
};

// --- MENSAJES A PACIENTES ---

const enviarMensajePaciente = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { id } = req.params;
    const { asunto, mensaje } = req.body;

    if (!asunto?.trim() || !mensaje?.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'DATOS_INCOMPLETOS',
        message: 'Asunto y mensaje son requeridos.'
      });
    }

    const paciente = await Paciente.findOne({ where: { id, profesionalId } });
    if (!paciente) {
      return res.status(404).json({ ok: false, error: 'PACIENTE_NO_ENCONTRADO' });
    }

    const profesional = await Profesional.findByPk(profesionalId, {
      attributes: ['nombre', 'apellido']
    });

    const { sendMail } = require('../config/mailer');
    await sendMail({
      to: paciente.email,
      subject: asunto,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:8px;">
          <p>Hola <strong>${paciente.nombre}</strong>,</p>
          <div style="white-space:pre-line;line-height:1.6;margin:16px 0;color:#333;">${mensaje.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
          <p style="margin-top:24px;font-size:0.85em;color:#666;">
            Saludos,<br>
            ${profesional.nombre} ${profesional.apellido}
          </p>
        </div>
      `
    });

    res.json({ ok: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    next(error);
  }
};

// --- CREDENCIALES DE PAGO ---

const guardarCredencialesPago = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { pasarela, accessToken, publishableKey } = req.body;

    if (!pasarela || !accessToken) {
      return res.status(400).json({
        ok: false,
        error: 'DATOS_INCOMPLETOS',
        message: 'Pasarela y token son requeridos.'
      });
    }

    if (!['mercadopago', 'stripe'].includes(pasarela)) {
      return res.status(400).json({
        ok: false,
        error: 'PASARELA_INVALIDA',
        message: 'Pasarela no soportada',
      });
    }

    await upsertConnection(profesionalId, pasarela, {
      accessToken,
      publishableKey: pasarela === 'stripe' ? publishableKey || null : null,
      status: 'conectado',
    });

    await Profesional.update(
      { pasarelaPago: pasarela },
      { where: { id: profesionalId } }
    );

    res.json({ ok: true, statusConexion: 'CONECTADO', message: 'Credenciales guardadas correctamente.' });
  } catch (error) {
    next(error);
  }
};

const getEstadoCredencialesPago = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const [profesional, intConf, mpConn, stripeConn] = await Promise.all([
      Profesional.findByPk(profesionalId, { attributes: ['pagoCredenciales', 'pasarelaPago'] }),
      getIntegracionesConfig(),
      getConnection(profesionalId, 'mercadopago'),
      getConnection(profesionalId, 'stripe'),
    ]);

    const credenciales = profesional?.pagoCredenciales
      ? (typeof profesional.pagoCredenciales === 'string'
          ? JSON.parse(profesional.pagoCredenciales)
          : profesional.pagoCredenciales)
      : null;

    const mpConectado = !!(mpConn?.accessToken || credenciales?.mercadopago?.accessToken);
    const stripeConectado = !!(
      stripeConn?.accessToken ||
      stripeConn?.providerUserId ||
      credenciales?.stripe?.stripeUserId ||
      credenciales?.stripe?.accountId ||
      credenciales?.stripe?.accessToken
    );

    res.json({
      ok: true,
      data: {
        statusConexion: mpConectado || stripeConectado ? 'CONECTADO' : 'DESCONECTADO',
        pasarela: profesional?.pasarelaPago || null,
        oauthDisponible: !!(intConf.MP_CLIENT_ID && intConf.MP_CLIENT_SECRET),
        stripeOauthDisponible: !!(intConf.STRIPE_CLIENT_ID && intConf.STRIPE_SECRET_KEY),
        mpEmail: mpConn?.providerEmail
          || credenciales?.mercadopago?.email
          || (credenciales?.mercadopago?.mpUserId ? `ID: ${credenciales.mercadopago.mpUserId}` : null),
        stripeEmail: stripeConn?.providerEmail || credenciales?.stripe?.email || null,
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- MERCADOPAGO OAUTH ---

const jwt = require('jsonwebtoken');
const https = require('https');
const { getIntegracionesConfig } = require('../services/integraciones.service');

const getMpOAuthUrl = async (req, res, next) => {
  try {
    const intConf = await getIntegracionesConfig();
    const clientId = intConf.MP_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ ok: false, message: 'OAuth de MercadoPago no configurado (MP_CLIENT_ID faltante).' });
    }
    const profesionalId = req.user.sub;
    const state = jwt.sign({ profesionalId }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const redirectUri = `${process.env.API_URL}/api/mp/oauth/callback`;
    const url =
      `https://auth.mercadopago.com/authorization` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&platform_id=mp` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;
    res.json({ ok: true, url });
  } catch (error) {
    next(error);
  }
};

const mpOAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  const frontendUrl = process.env.APP_URL || 'http://localhost:5173';

  try {
    if (!code || !state) throw new Error('Parámetros incompletos');

    const { profesionalId } = jwt.verify(state, process.env.JWT_SECRET);

    // Intercambiar código por access_token
    const intConf = await getIntegracionesConfig();
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: intConf.MP_CLIENT_ID,
      client_secret: intConf.MP_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.API_URL}/api/mp/oauth/callback`,
    });
    const body = params.toString();

    const mpData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mercadopago.com',
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      };
      const request = https.request(options, (resp) => {
        let raw = '';
        resp.on('data', chunk => { raw += chunk; });
        resp.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      });
      request.on('error', reject);
      request.write(body);
      request.end();
    });

    if (!mpData.access_token) {
      throw new Error(mpData.message || 'No se obtuvo access_token de MercadoPago');
    }

    // Obtener email del usuario de MercadoPago
    let mpEmail = null;
    try {
      const userInfo = await new Promise((resolve, reject) => {
        const opts = {
          hostname: 'api.mercadopago.com',
          path: '/users/me',
          method: 'GET',
          headers: { Authorization: `Bearer ${mpData.access_token}` },
        };
        const req2 = https.request(opts, (resp) => {
          let raw = '';
          resp.on('data', c => { raw += c; });
          resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
        });
        req2.on('error', reject);
        req2.end();
      });
      mpEmail = userInfo.email || null;
    } catch (e) {
      console.warn('[MP OAuth] No se pudo obtener email del usuario:', e.message);
    }

    const credencialesObj = {
      mercadopago: {
        accessToken: mpData.access_token,
        refreshToken: mpData.refresh_token || null,
        mpUserId: mpData.user_id || null,
        email: mpEmail,
      }
    };

    await upsertConnection(profesionalId, 'mercadopago', {
      accessToken: mpData.access_token,
      refreshToken: mpData.refresh_token || null,
      providerUserId: mpData.user_id ? String(mpData.user_id) : null,
      providerEmail: mpEmail,
      status: 'conectado',
      metadata: { scope: mpData.scope || null },
    });

    await Profesional.update(
      { pagoCredenciales: JSON.stringify(credencialesObj), pasarelaPago: 'mercadopago' },
      { where: { id: profesionalId } }
    );

    res.redirect(`${frontendUrl}/profesional/pagos-config?mp_connected=true`);
  } catch (error) {
    console.error('[MP OAuth callback error]', error.message);
    res.redirect(`${frontendUrl}/profesional/pagos-config?mp_connected=error`);
  }
};

const desconectarPasarela = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    await disconnectByProfesional(profesionalId);
    await Profesional.update(
      { pagoCredenciales: null, pasarelaPago: null },
      { where: { id: profesionalId } }
    );
    res.json({ ok: true, message: 'Pasarela desconectada correctamente' });
  } catch (error) {
    next(error);
  }
};

// --- STRIPE CONNECT OAUTH ---

const getStripeOAuthUrl = async (req, res, next) => {
  try {
    const intConf = await getIntegracionesConfig();
    const clientId = intConf.STRIPE_CLIENT_ID; // ca_xxx
    if (!clientId) {
      return res.status(503).json({ ok: false, message: 'OAuth de Stripe no configurado (STRIPE_CLIENT_ID faltante).' });
    }
    const profesionalId = req.user.sub;
    const state = jwt.sign({ profesionalId }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const redirectUri = `${process.env.API_URL}/api/stripe/oauth/callback`;
    const url =
      `https://connect.stripe.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&scope=read_write` +
      `&state=${encodeURIComponent(state)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({ ok: true, url });
  } catch (error) {
    next(error);
  }
};

const stripeOAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  const frontendUrl = process.env.APP_URL || 'http://localhost:5173';

  try {
    if (!code || !state) throw new Error('Parámetros incompletos');

    const { profesionalId } = jwt.verify(state, process.env.JWT_SECRET);

    const intConf = await getIntegracionesConfig();

    // Intercambiar código por access_token usando Stripe Connect
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
    }).toString();

    const stripeData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'connect.stripe.com',
        path: '/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'Authorization': `Bearer ${intConf.STRIPE_SECRET_KEY}`,
        },
      };
      const request = https.request(options, (resp) => {
        let raw = '';
        resp.on('data', chunk => { raw += chunk; });
        resp.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      });
      request.on('error', reject);
      request.write(body);
      request.end();
    });

    if (!stripeData.access_token) {
      throw new Error(stripeData.error_description || stripeData.error || 'No se obtuvo access_token de Stripe');
    }

    const credencialesObj = {
      stripe: {
        accessToken: stripeData.access_token,
        stripeUserId: stripeData.stripe_user_id,
        publishableKey: stripeData.stripe_publishable_key || null,
      }
    };

    await upsertConnection(profesionalId, 'stripe', {
      accessToken: stripeData.access_token,
      refreshToken: stripeData.refresh_token || null,
      providerUserId: stripeData.stripe_user_id ? String(stripeData.stripe_user_id) : null,
      providerEmail: stripeData.stripe_user_email || null,
      publishableKey: stripeData.stripe_publishable_key || null,
      status: 'conectado',
      metadata: { scope: stripeData.scope || null },
    });

    await Profesional.update(
      { pagoCredenciales: JSON.stringify(credencialesObj), pasarelaPago: 'stripe' },
      { where: { id: profesionalId } }
    );

    res.redirect(`${frontendUrl}/profesional/pagos-config?stripe_connected=true`);
  } catch (error) {
    console.error('[Stripe OAuth callback error]', error.message);
    res.redirect(`${frontendUrl}/profesional/pagos-config?stripe_connected=error`);
  }
};

module.exports = {
  getTurnos,
  getTurnoById,
  crearTurnoManual,
  confirmarTurno,
  rechazarTurno,
  marcarAusente,
  cancelarTurno,
  reprogramarTurno,
  getPacientes,
  getPacienteById,
  crearPacienteManual,
  enviarMensajePaciente,
  getPerfil,
  updatePerfil,
  getMetricasDashboard,
  guardarCredencialesPago,
  getEstadoCredencialesPago,
  getMpOAuthUrl,
  mpOAuthCallback,
  desconectarPasarela,
  getStripeOAuthUrl,
  stripeOAuthCallback,
};
