import { Outlet } from 'react-router-dom'

export default function PacienteLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
