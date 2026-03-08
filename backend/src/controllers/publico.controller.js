const { Profesional, ConfiguracionDia, Paciente, Turno } = require("../models");
const disponibilidadService = require("../services/disponibilidad.service");
const turnoService = require("../services/turno.service");

// GET /api/publico/:slug
const getPerfilProfesional = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const profesional = await Profesional.findOne({
      where: { slug },
      attributes: {
        exclude: ["passwordHash", "pagoCredenciales", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: ConfiguracionDia,
          as: "diasConfiguracion",
          attributes: ["dia", "horaInicio", "horaFin", "habilitado"],
        },
      ],
    });

    if (!profesional) {
      return res.status(404).json({
        ok: false,
        error: "PROFESIONAL_NO_ENCONTRADO",
        message: "No se encontró el profesional solicitado",
      });
    }

    const data = profesional.toJSON();

    // Solo días habilitados para el frontend público
    data.diasConfiguracion = data.diasConfiguracion.filter((d) => d.habilitado);

    // Convertir obrasSocialesTexto (string) → obrasSociales (array)
    data.obrasSociales = data.obrasSocialesTexto
      ? data.obrasSocialesTexto
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Convertir aceptaObrasSociales a boolean real (MySQL devuelve 0/1)
    data.aceptaObrasSociales = Boolean(data.aceptaObrasSociales);

    // Convertir modalidad ENUM → formato frontend
    const modalidadMap = {
      presencial: "Presencial",
      virtual: "Virtual",
      ambas: "Presencial y Virtual",
    };
    data.modalidad = modalidadMap[data.modalidad] || data.modalidad;

    // Convertir confirmacionAutomatica a boolean real
    data.confirmacionAutomatica = Boolean(data.confirmacionAutomatica);

    // Convertir pagoObligatorio a boolean real
    data.pagoObligatorio = Boolean(data.pagoObligatorio);

    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/publico/:slug/horarios?fecha=YYYY-MM-DD
const getSlotsDisponibles = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "FALTA_FECHA",
          message: "Debe proporcionar una fecha query param",
        });
    }

    const profesional = await Profesional.findOne({ where: { slug } });
    if (!profesional) {
      return res
        .status(404)
        .json({
          ok: false,
          error: "PROFESIONAL_NO_ENCONTRADO",
          message: "Profesional no encontrado",
        });
    }

    const slots = await disponibilidadService.calcularSlotsDisponibles(
      profesional.id,
      fecha,
    );

    res.json({ ok: true, data: slots });
  } catch (error) {
    next(error);
  }
};

// POST /api/publico/:slug/reservar
const crearReserva = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const resultado = await turnoService.crearReserva(slug, req.body);

    res.status(201).json({
      ok: true,
      data: resultado,
      message: "Turno reservado con éxito",
    });
  } catch (error) {
    if (error.message === "SLOT_NO_DISPONIBLE") {
      return res
        .status(409)
        .json({
          ok: false,
          error: "SLOT_NO_DISPONIBLE",
          message: "El horario seleccionado ya no está disponible",
        });
    }
    if (error.message === "PROFESIONAL_NO_ENCONTRADO") {
      return res
        .status(404)
        .json({
          ok: false,
          error: "PROFESIONAL_NO_ENCONTRADO",
          message: "Profesional no encontrado",
        });
    }
    next(error);
  }
};

module.exports = {
  getPerfilProfesional,
  getSlotsDisponibles,
  crearReserva,
  getTurno,
  cancelarTurnoPublico,
  reprogramarTurnoPublico,
};

// GET /api/publico/:slug/turno/:id
async function getTurno(req, res, next) {
  try {
    const { slug, id } = req.params;
    const profesional = await Profesional.findOne({ where: { slug } });
    if (!profesional) return res.status(404).json({ ok: false, error: "PROFESIONAL_NO_ENCONTRADO" });

    const turno = await Turno.findOne({
      where: { id, profesionalId: profesional.id },
      include: [{ model: Paciente, as: "paciente", attributes: ["nombre", "apellido", "email", "telefono"] }],
    });
    if (!turno) return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });

    res.json({ ok: true, data: { ...turno.toJSON(), profesional: { nombre: `${profesional.nombre} ${profesional.apellido}`, especialidad: profesional.especialidad, modalidad: profesional.modalidad, direccion: profesional.direccion, duracionTurno: profesional.duracionTurno, permiteReprogramar: true, horasMinCancelacion: profesional.horasMinCancelacion || 24 } } });
  } catch (error) { next(error); }
}

// PATCH /api/publico/:slug/turno/:id/cancelar
async function cancelarTurnoPublico(req, res, next) {
  try {
    const { slug, id } = req.params;
    const { motivo } = req.body;
    const profesional = await Profesional.findOne({ where: { slug } });
    if (!profesional) return res.status(404).json({ ok: false, error: "PROFESIONAL_NO_ENCONTRADO" });

    const turno = await Turno.findOne({ where: { id, profesionalId: profesional.id } });
    if (!turno) return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });
    if (turno.estado === "cancelado") return res.status(400).json({ ok: false, error: "TURNO_YA_CANCELADO" });

    await turno.update({ estado: "cancelado", motivoCancelacion: motivo || null });
    res.json({ ok: true, data: turno });
  } catch (error) { next(error); }
}

// PATCH /api/publico/:slug/turno/:id/reprogramar
async function reprogramarTurnoPublico(req, res, next) {
  try {
    const { slug, id } = req.params;
    const { fecha, horaInicio } = req.body;
    if (!fecha || !horaInicio) return res.status(400).json({ ok: false, error: "FALTAN_DATOS" });

    const profesional = await Profesional.findOne({ where: { slug } });
    if (!profesional) return res.status(404).json({ ok: false, error: "PROFESIONAL_NO_ENCONTRADO" });

    const turno = await Turno.findOne({ where: { id, profesionalId: profesional.id } });
    if (!turno) return res.status(404).json({ ok: false, error: "TURNO_NO_ENCONTRADO" });
    if (turno.estado === "cancelado") return res.status(400).json({ ok: false, error: "TURNO_CANCELADO" });

    // Verificar disponibilidad del nuevo slot
    const slots = await disponibilidadService.calcularSlotsDisponibles(profesional.id, fecha);
    const slot = slots.find(s => s.hora === horaInicio);
    if (!slot || !slot.disponible) return res.status(409).json({ ok: false, error: "SLOT_NO_DISPONIBLE" });

    const [h, m] = horaInicio.split(":").map(Number);
    const dateCalc = new Date(2000, 0, 1, h, m);
    dateCalc.setMinutes(dateCalc.getMinutes() + profesional.duracionTurno);
    const horaFin = `${dateCalc.getHours().toString().padStart(2, "0")}:${dateCalc.getMinutes().toString().padStart(2, "0")}`;

    await turno.update({ fecha, horaInicio, horaFin });
    res.json({ ok: true, data: turno });
  } catch (error) { next(error); }
}
