// Módulo Paciente
export { default as LandingProfesionalPage } from './pacientes/LandingProfesionalPage.jsx'
export { default as CalendarioReservaPage } from './pacientes/CalendarioReservaPage.jsx'
export {default as FormularioReservaPage} from './pacientes/FormularioReservaPage.jsx'
export { default as ConfirmacionPendientePage } from './pacientes/ConfirmacionPendientePage.jsx'
export { default as TurnoConfirmadoPage } from './pacientes/TurnoConfirmadoPage.jsx'
export { default as GestionTurnoPage } from './pacientes/GestionTurnoPage.jsx'


// Módulo Profesional
export { default as LoginProfesionalPage } from './profesional/LoginPage.jsx'
export { default as DashboardProfesionalPage } from './profesional/DashboardProfesionalPage.jsx'
export { default as AgendaProfesionalPage } from './profesional/AgendaProfesionalPage.jsx'
export { default as TurnosPendientesPage } from './profesional/TurnosPendientesPage.jsx'
export { default as PacientesPage } from './profesional/PacientesPage.jsx'
export { default as ConfigRecordatoriosPage} from './profesional/ConfigRecordatoriosPage.jsx'
export {default as ConfigPagosPage} from './profesional/ConfigPagosPage.jsx'
export {default as PagosRecibidosPage} from './profesional/PagosRecibidosPage.jsx'
export {default as PerfilPublicoPage} from './profesional/PerfilPublicoPage.jsx'

// Módulo Admin SaaS
export {default as AdminLoginPage} from './admin/AdminLoginPage.jsx'
export {default as DashboardAdminPage} from './admin/DashboardAdminPage.jsx'
export {default as GestionProfesionalesPage} from './admin/GestionProfesionalesPage.jsx'

// Not Found
export const NotFoundPage = () => <div>404 - Página no encontrada</div>
