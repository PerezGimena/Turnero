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
const recordatorioService = require("../services/recordatorio.service");

// --- TURNOS ---

const getTurnos = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { fecha, estado, pagina = 1, porPagina = 20 } = req.query;

    const where = { profesionalId };
    if (fecha) where.fecha = fecha;
    if (estado) where.estado = estado;

    const limit = parseInt(porPagina);
    const offset = (parseInt(pagina) - 1) * limit;

    const { count, rows } = await Turno.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["fecha", "ASC"],
        ["horaInicio", "ASC"],
      ],
      include: [
        {
          model: Paciente,
          as: "paciente",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
    });

    res.json({
      ok: true,
      data: rows,
      pagination: {
        total: count,
        pagina: parseInt(pagina),
        porPagina: limit,
        totalPaginas: Math.ceil(count / limit),
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

// --- PACIENTES ---

const getPacientes = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { busqueda, pagina = 1, porPagina = 20 } = req.query;

    const where = { profesionalId };
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { email: { [Op.like]: `%${busqueda}%` } },
        { dni: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const limit = parseInt(porPagina);
    const offset = (parseInt(pagina) - 1) * limit;

    const { count, rows } = await Paciente.findAndCountAll({
      where,
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
        pagina: parseInt(pagina),
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
    const hoy = new Date().toISOString().split("T")[0];

    const turnosHoy = await Turno.count({
      where: { profesionalId, fecha: hoy, estado: { [Op.not]: "cancelado" } },
    });

    const pendientes = await Turno.count({
      where: { profesionalId, estado: "pendiente" },
    });

    res.json({ ok: true, data: { turnosHoy, pendientes } });
  } catch (error) {
    next(error);
  }
};

const enviarRecordatorioPrueba = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const { emailDestino } = req.body;

    const profesional = await Profesional.findByPk(profesionalId);

    const mockTurno = {
      fecha: "2024-12-01",
      horaInicio: "10:00",
      modalidad: "presencial",
      referencia: "PRUEBA-123",
    };

    const mockPaciente = {
      nombre: "Paciente de Prueba",
      email: emailDestino || profesional.email,
    };

    await recordatorioService.enviarConfirmacionReserva(
      mockTurno,
      mockPaciente,
      profesional,
    );

    res.json({
      ok: true,
      message: `Email de prueba enviado a ${mockPaciente.email}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTurnos,
  getTurnoById,
  crearTurnoManual,
  confirmarTurno,
  rechazarTurno,
  getPacientes,
  getPacienteById,
  getPerfil,
  updatePerfil,
  getMetricasDashboard,
  enviarRecordatorioPrueba,
};
