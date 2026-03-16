import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import PacienteLayout from '../layouts/PacienteLayout.jsx'
import ProfesionalLayout from '../layouts/ProfesionalLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import useAuthStore from '../store/useAuthStore.jsx'

// Componente que protege rutas privadas según rol
function ProtectedRoute({ redirectTo, rol }) {
  const { esAutenticado, rol: userRol } = useAuthStore()
  if (!esAutenticado) return <Navigate to={redirectTo} replace />
  if (rol && userRol !== rol) return <Navigate to={redirectTo} replace />
  return <Outlet />
}


import {
  LandingProfesionalPage,
  CalendarioReservaPage,
  FormularioReservaPage,
  ConfirmacionPendientePage,
  TurnoConfirmadoPage,
  GestionTurnoPage,
  LoginProfesionalPage,
  RegistroPage,
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
  IntegracionesAdminPage,
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
  {
    path: '/profesional/registro',
    element: <RegistroPage />
  },

  // Módulo Profesional (Privado - con Sidebar)
  {
    path: '/profesional',
    element: <ProtectedRoute redirectTo="/profesional/login" rol="profesional" />,
    children: [
      {
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
      }
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
    element: <ProtectedRoute redirectTo="/admin/login" rol="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <DashboardAdminPage /> },
          { path: 'profesionales', element: <GestionProfesionalesPage /> },
          { path: 'integraciones', element: <IntegracionesAdminPage /> },
        ]
      }
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
