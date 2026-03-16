const app = require('./src/app');
const sequelize = require('./src/config/database');
const { iniciarCronJobs } = require('./src/services/cron.service');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Probar conexión a BD
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida correctamente.');

    // No sincronizamos (sync) porque usamos script SQL / migraciones
    // await sequelize.sync({ alter: false }); 

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📄 Documentación: http://localhost:${PORT}/api/docs (No implementado aun)`);
    });

    // Iniciar cron jobs (recordatorios y detección de ausencias)
    iniciarCronJobs();
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
