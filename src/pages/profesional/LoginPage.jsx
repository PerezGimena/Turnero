import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.jsx'

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const procesarLogin = async (data) => {
    setCargando(true)
    
    // Simulación de llamada a API
    setTimeout(() => {
      // Login exitoso simulado
      login({
        id: '1',
        nombre: 'Juan Pérez',
        email: data.email,
        rol: 'profesional',
        slug: 'dr-juan-perez'
      }, 'token-falso-123')
      
      setCargando(false)
      navigate('/profesional/dashboard')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Lado izquierdo (40%) - Branding */}
      <div className="hidden lg:flex w-[40%] bg-slate-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 max-w-md space-y-8">
          <div className="h-16 w-16 bg-profesional rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-4xl font-display font-bold leading-tight">
            Gestioná tus turnos de manera inteligente
          </h2>
          
          <p className="text-slate-400 text-lg">
            Reducí el ausentismo y automatizá tu agenda médica con TurnoSalud.
          </p>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-profesional">✓</div>
              <span className="text-slate-300">Recordatorios automáticos por WhatsApp</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-profesional">✓</div>
              <span className="text-slate-300">Pagos integrados con MercadoPago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-profesional">✓</div>
              <span className="text-slate-300">Agenda personalizada 100% online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho (60%) - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-display font-bold text-slate-900">
              Turno<span className="text-profesional">Salud</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-slate-900">Bienvenido/a de nuevo</h1>
            <p className="text-slate-500">Ingresá tus credenciales para acceder al panel.</p>
          </div>

          <form onSubmit={handleSubmit(procesarLogin)} className="space-y-6">
            
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                {...register('email')}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            {/* Campo Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Contraseña</label>
                <Link to="#" className="text-sm font-medium text-profesional hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">¿Sos nuevo?</span>
            </div>
          </div>

          <div className="text-center">
            <Link to="#" className="text-sm font-medium text-slate-900 underline hover:text-slate-700">
              Crear una cuenta profesional
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
