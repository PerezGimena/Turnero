import { Link } from 'react-router-dom'
import { ArrowLeft, Home, SearchX } from 'lucide-react'
import useAuthStore from '../store/useAuthStore.jsx'

export default function NotFoundPage() {
  const { esAutenticado, rol } = useAuthStore()
  const homeLink = esAutenticado
    ? rol === 'admin' ? '/admin/dashboard' : '/profesional/dashboard'
    : '/profesional/login'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <SearchX size={36} className="text-slate-400" />
        </div>
        <p className="text-7xl font-black text-slate-200 leading-none mb-3">404</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Página no encontrada</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          La página que buscás no existe o fue movida a otra dirección.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <Link
            to={homeLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Home size={14} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
