import { createBrowserRouter, Navigate } from 'react-router-dom'
import PacienteLayout from '../layouts/PacienteLayout.jsx'
import ProfesionalLayout from '../layouts/ProfesionalLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'


import {
  LandingProfesionalPage,
  CalendarioReservaPage,
  FormularioReservaPage,
  ConfirmacionPendientePage,
  TurnoConfirmadoPage,
  GestionTurnoPage,
  LoginProfesionalPage,
  DashboardProfesionalPage,
  AgendaProfesionalPage,
  TurnosPendientesPage,
  PacientesPage,
  ConfigRecordatoriosPage,
  ConfigPagosPage,
  PagosRecibidosPage,
  PerfilPublicoPage,
  AdminLoginPage,
  DashboardAdminPage,
  GestionProfesionalesPage,
  NotFoundPage
} from '../pages/index.jsx'

const router = createBrowserRouter([
  // Redirección raíz (temporalmente al login profesional)
  {
    path: '/',
    element: <Navigate to="/profesional/login" replace />
  },

  // Módulo Profesional (Público - Login)
  {
    path: '/profesional/login',
    element: <LoginProfesionalPage />
  },

  // Módulo Profesional (Privado - con Sidebar)
  {
    path: '/profesional',
    element: <ProfesionalLayout />,
    children: [
      { path: 'dashboard', element: <DashboardProfesionalPage /> },
      { path: 'agenda', element: <AgendaProfesionalPage /> },
      { path: 'turnos-pendientes', element: <TurnosPendientesPage /> },
      { path: 'pacientes', element: <PacientesPage /> },
      { path: 'recordatorios', element: <ConfigRecordatoriosPage /> },
      { path: 'pagos-config', element: <ConfigPagosPage /> },
      { path: 'pagos-recibidos', element: <PagosRecibidosPage /> },
      { path: 'perfil-publico', element: <PerfilPublicoPage /> },
    ]
  },

  // Módulo Admin (Público - Login)
  {
    path: '/admin/login',
    element: <AdminLoginPage />
  },

  // Módulo Admin (Privado)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <DashboardAdminPage /> },
      { path: 'profesionales', element: <GestionProfesionalesPage /> },
    ]
  },

  // Módulo Paciente (Público - Rutas dinámicas al final para evitar conflictos)
  {
    path: '/:slug',
    element: <PacienteLayout />,
    children: [
      { index: true, element: <LandingProfesionalPage /> },
      { path: 'reservar', element: <CalendarioReservaPage /> },
      { path: 'reservar/formulario', element: <FormularioReservaPage /> },
      { path: 'reservar/pendiente', element: <ConfirmacionPendientePage /> },
      { path: 'reservar/confirmado', element: <TurnoConfirmadoPage /> },
      { path: 'turno/:id', element: <GestionTurnoPage /> },
    ]
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFoundPage />
  }
])

export default router
