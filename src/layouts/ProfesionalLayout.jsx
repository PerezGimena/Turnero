import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import TopBar from '../components/layout/TopBar.jsx'

export default function ProfesionalLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal a la derecha */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
