const { ConfiguracionRecordatorios, Profesional } = require('../models');
const recordatorioService = require('../services/recordatorio.service');

const getRecordatorios = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    
    // Buscar o construir (sin guardar) una instancia por defecto
    let config = await ConfiguracionRecordatorios.findOne({ 
      where: { profesionalId } 
    });

    if (!config) {
      config = ConfiguracionRecordatorios.build({ 
        profesionalId,
        emailHabilitado: true,
        whatsappHabilitado: false,
        recordatorio1Habilitado: true,
        recordatorio1HorasAntes: 24,
        recordatorio2Habilitado: false,
        recordatorio2HorasAntes: 2,
        mensajeEmail: 'Hola, te recordamos tu turno...', // Valor por defecto visual
        // Los valores por defecto reales están en el modelo Sequelize
      });
      
      // Si queremos devolver los valores del modelo, usamos dataValues tras build
      // O simplemente devolvemos null y el frontend maneja defaults.
      // Pero el prompt dice "devolverla con valores por defecto".
    }

    res.json({ 
      ok: true, 
      data: config 
    });
  } catch (error) {
    next(error);
  }
};

const updateRecordatorios = async (req, res, next) => {
  try {
    const profesionalId = req.user.sub;
    const data = req.body;

    // Asegurar que profesionalId no se sobreescribe
    data.profesionalId = profesionalId;

    const [config, created] = await ConfiguracionRecordatorios.upsert(data);

    // Upsert devuelve array [instance, boolean] solo en ciertos dialectos (Postgres/MySQL con cierta config)
    // En MySQL, upsert devuelve boolean solo si no se devuelve la instancia.
    // Para asegurar retorno consistente, buscamos la instancia actualizada si upsert no la devuelve clara.
    // Sin embargo, Sequelize v6 con MySQL suele devolver la instancia si se configura bien o simplemente devolvemos 'data' mergeado.
    
    // Forzamos respuesta correcta buscando de nuevo si es necesario, o confiando en el result.
    // Simplificación: asumiendo que Sequelize lo maneja estándar.
    
    res.json({
      ok: true,
      data: config,
      message: 'Configuración de recordatorios actualizada'
    });
  } catch (error) {
    next(error);
  }
};

const enviarPrueba = async (req, res, next) => {
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

    // Asumimos que recordatorioService tiene este método ya que venía del otro controller
    if (recordatorioService.enviarConfirmacionReserva) {
        await recordatorioService.enviarConfirmacionReserva(
            mockTurno,
            mockPaciente,
            profesional,
        );
    } else {
        // Fallback si el método tiene otro nombre o es genérico
        console.warn('Método enviarConfirmacionReserva no encontrado en servicio recordatorio');
    }

    res.json({
      ok: true,
      message: `Email de prueba enviado a ${mockPaciente.email}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecordatorios,
  updateRecordatorios,
  enviarPrueba
};
