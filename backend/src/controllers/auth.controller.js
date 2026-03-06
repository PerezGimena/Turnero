const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { Profesional, Admin, ConfiguracionDia } = require('../models');

// Registro Profesional
const registroProfesional = async (req, res) => {
  try {
    const { nombre, apellido, email, password, especialidad } = req.body;

    if (!nombre || !apellido || !email || !password) {
       return res.status(400).json({
          ok: false,
          error: 'DATOS_INCOMPLETOS',
          message: 'Faltan datos obligatorios'
       });
    }

    const existeEmail = await Profesional.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        error: 'EMAIL_DUPLICADO',
        message: 'El email ya está registrado'
      });
    }

    // Slug generator
    let slugBase = `${nombre.toLowerCase()}-${apellido.toLowerCase()}`
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
      
    let slug = slugBase;
    let counter = 1;
    while (await Profesional.findOne({ where: { slug } })) {
      counter++;
      slug = `${slugBase}-${counter}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoProfesional = await Profesional.create({
      nombre,
      apellido,
      email,
      passwordHash,
      especialidad: especialidad || 'General',
      slug,
      modalidad: 'Presencial', // Default
      duracionTurno: 30
    });

    // Create default config for 7 days
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const configPromises = dias.map(dia => ConfiguracionDia.create({
      profesionalId: nuevoProfesional.id,
      dia,
      horaInicio: '09:00',
      horaFin: '17:00',
      habilitado: false
    }));
    await Promise.all(configPromises);

    // Generate JWT
    const payload = {
      sub: nuevoProfesional.id,
      rol: 'profesional',
      email: nuevoProfesional.email,
      slug: nuevoProfesional.slug
    };

    const token = generateToken(payload, process.env.JWT_EXPIRATION_PROFESIONAL || '7d');

    // Quitar data sensible
    const profesionalData = nuevoProfesional.toJSON();
    delete profesionalData.passwordHash;

    res.status(201).json({
      ok: true,
      data: {
        token,
        usuario: profesionalData
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'ERROR_INTERNO',
      message: 'Error al registrar profesional'
    });
  }
};

// Login Profesional
const loginProfesional = async (req, res) => {
  try {
    const { email, password } = req.body;

    const profesional = await Profesional.findOne({ where: { email } });

    if (!profesional) {
      return res.status(401).json({
        ok: false,
        error: 'CREDENCIALES_INVALIDAS',
        message: 'Email o contraseña incorrectos'
      });
    }

    const validPassword = await bcrypt.compare(password, profesional.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        error: 'CREDENCIALES_INVALIDAS',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const payload = {
      sub: profesional.id,
      rol: 'profesional',
      email: profesional.email,
      slug: profesional.slug
    };

    const token = generateToken(payload, process.env.JWT_EXPIRATION_PROFESIONAL || '7d');

    // Quitar data sensible
    const profesionalData = profesional.toJSON();
    delete profesionalData.passwordHash;
    delete profesionalData.pagoCredenciales;

    res.json({
      ok: true,
      data: {
        token,
        usuario: profesionalData
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'ERROR_INTERNO',
      message: 'Error al iniciar sesión'
    });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({
        ok: false,
        error: 'CREDENCIALES_INVALIDAS',
        message: 'Email o contraseña incorrectos'
      });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        error: 'CREDENCIALES_INVALIDAS',
        message: 'Email o contraseña incorrectos'
      });
    }

    const payload = {
      sub: admin.id,
      rol: 'admin',
      email: admin.email
    };

    const token = generateToken(payload, process.env.JWT_EXPIRATION_ADMIN || '1d');

    const adminData = admin.toJSON();
    delete adminData.passwordHash;

    res.json({
      ok: true,
      data: {
        token,
        usuario: adminData
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'ERROR_INTERNO',
      message: 'Error al iniciar sesión'
    });
  }
};

// Get Me Profesional
const getMeProfesional = async (req, res) => {
  try {
    const profesional = await Profesional.findByPk(req.user.sub, {
      attributes: { exclude: ['passwordHash', 'pagoCredenciales'] }
    });

    if (!profesional) {
      return res.status(404).json({
        ok: false,
        error: 'USUARIO_NO_ENCONTRADO',
        message: 'El profesional no existe'
      });
    }

    res.json({
      ok: true,
      data: profesional
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'ERROR_INTERNO',
      message: 'Error al obtener perfil'
    });
  }
};

// Get Me Admin
const getMeAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.sub, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!admin) {
      return res.status(404).json({
        ok: false,
        error: 'USUARIO_NO_ENCONTRADO',
        message: 'El administrador no existe'
      });
    }

    res.json({
      ok: true,
      data: admin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'ERROR_INTERNO',
      message: 'Error al obtener perfil'
    });
  }
};

module.exports = {
  loginProfesional,
  registroProfesional,
  loginAdmin,
  getMeProfesional,
  getMeAdmin
};
