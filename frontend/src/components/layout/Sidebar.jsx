import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/profesional/login')
  }

  const getItemClass = (path) => {
    const isActive = location.pathname === path
    return isActive 
      ? 'flex items-center gap-3 px-4 py-2 bg-slate-800 text-white border-l-4 border-profesional transition-colors'
      : 'flex items-center gap-3 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border-l-4 border-transparent'
  }

  return (
    <aside className="w-[240px] flex flex-col h-full bg-slate-950 border-r border-slate-800">
      <div className="h-14 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-display font-bold text-white tracking-tight">
          Turno<span className="text-profesional">Salud</span>
        </span>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Principal
        </div>
        <Link to="/profesional/dashboard" className={getItemClass('/profesional/dashboard')}>
          <span>🏠</span> Dashboard
        </Link>
        <Link to="/profesional/agenda" className={getItemClass('/profesional/agenda')}>
          <span>📅</span> Agenda
        </Link>
        <Link to="/profesional/turnos-pendientes" className={getItemClass('/profesional/turnos-pendientes')}>
          <span>⏳</span> Turnos pendientes
        </Link>
        <Link to="/profesional/pacientes" className={getItemClass('/profesional/pacientes')}>
          <span>👥</span> Pacientes
        </Link>

        <div className="mt-8 px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Configuración
        </div>
        <Link to="/profesional/recordatorios" className={getItemClass('/profesional/recordatorios')}>
          <span>🔔</span> Recordatorios
        </Link>
        <Link to="/profesional/pagos-config" className={getItemClass('/profesional/pagos-config')}>
          <span>💳</span> Pagos
        </Link>
        <Link to="/profesional/perfil-publico" className={getItemClass('/profesional/perfil-publico')}>
          <span>🌐</span> Perfil público
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white w-full transition-colors"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}