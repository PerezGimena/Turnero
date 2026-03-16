const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // profesional-{id}-{timestamp}.{ext}
    // Si no tenemos el ID en el request (ej: creación), usamos 'temp' o un random
    const profesionalId = req.user ? req.user.sub : 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `profesional-${profesionalId}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Rechazar archivo
    cb(new Error('FORMATO_NO_VALIDO: Solo se permiten imágenes JPG, PNG o WEBP'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: fileFilter
});

// Middleware específico para foto de perfil (campo 'fotoPerfil')
const uploadFotoPerfil = (req, res, next) => {
  const uploadSingle = upload.single('fotoPerfil');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de Multer (ej: tamaño excedido)
      return res.status(400).json({
        ok: false,
        error: 'ERROR_SUBIDA',
        message: err.message
      });
    } else if (err) {
      // Error de validación de tipo de archivo u otro
      return res.status(400).json({
        ok: false,
        error: 'ARCHIVO_INVALIDO',
        message: err.message
      });
    }
    // Todo ok
    next();
  });
};

module.exports = { uploadFotoPerfil };
