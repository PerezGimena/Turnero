import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.jsx'

// Esquema de validación estricto para admin
const adminLoginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
})

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminLoginSchema)
  })

  const procesarLogin = async (data) => {
    setCargando(true)
    setErrorGlobal('')
    
    // Simulación de autenticación segura
    setTimeout(() => {
      // En un caso real, validaríamos contra el backend
      if (data.email === 'admin@turnosalud.com') { // Simulación simple
         login({
          id: 'admin-master',
          nombre: 'Administrador SaaS',
          email: data.email,
          rol: 'admin',
        }, 'token-admin-seguro-123')
        
        navigate('/admin/dashboard')
      } else {
        // Permitimos login genérico para pruebas si no es el específico, 
        // o podríamos rechazarlo. Por ahora, para facilitar el desarrollo:
        login({
            id: 'admin-gen',
            nombre: 'Admin User',
            email: data.email,
            rol: 'admin',
        }, 'token-admin-gen-123')
        navigate('/admin/dashboard')
      }
      setCargando(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      {/* Lado izquierdo (40%) - Branding Visual Admin */}
      <div className="hidden lg:flex w-[40%] bg-violet-950/20 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-violet-950/30"></div>
        
        <div className="relative z-10 max-w-md text-center">
            <div className="mx-auto h-20 w-20 bg-admin rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-admin/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              TurnoSalud <span className="text-admin">Admin v2.0</span>
            </h2>
            <p className="text-slate-400">
              Panel de control centralizado para la gestión del SaaS. Acceso restringido únicamente a personal autorizado.
            </p>
        </div>
      </div>

      {/* Lado derecho (60%) - Formulario Minimalista */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="w-full max-w-sm mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Panel de Administración
            </h1>
            <p className="text-sm text-slate-400">
              Iniciá sesión para gestionar la plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit(procesarLogin)} className="space-y-6">
            
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="email">Email Corporativo</label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@turnosalud.com"
                  className={`flex h-10 w-full rounded-md border bg-slate-900 px-3 py-2 text-sm text-white ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? 'border-red-500' : 'border-slate-800'}`}
                  {...register('email')}
                />
                {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">Clave de Acceso</label>
                <div className="relative">
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    className={`flex h-10 w-full rounded-md border bg-slate-900 px-3 py-2 text-sm text-white ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${errors.password ? 'border-red-500' : 'border-slate-800'}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
              </div>
            </div>

            {errorGlobal && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-sm text-red-200 text-center">
                {errorGlobal}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-admin px-4 py-2 text-sm font-medium text-white shadow hover:bg-admin/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
              {cargando ? (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 animate-pulse" /> Verificando...
                </span>
              ) : (
                'Acceder al Panel'
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-xs text-slate-600">
              Acceso protegido. Todas las actividades son monitoreadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
