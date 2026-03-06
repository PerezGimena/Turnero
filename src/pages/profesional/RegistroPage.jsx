import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.jsx'
import axios from 'axios'

// Esquema de validación
const registroSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  especialidad: z.string().min(3, 'Ingresá tu especialidad'),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export default function RegistroPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registroSchema)
  })

  const procesarRegistro = async (data) => {
    setCargando(true)
    setErrorRegistro('')

    try {
      const response = await axios.post('http://localhost:3001/api/auth/profesional/registro', {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        especialidad: data.especialidad
      })

      if (response.data.ok) {
        const { token, usuario } = response.data.data
        
        // Guardar en localStorage
        localStorage.setItem('token', token)
        
        // Actualizar estado global
        login(usuario, token)
        
        // Redireccionar
        navigate('/profesional/dashboard')
      }
    } catch (error) {
      console.error('Error de registro:', error)
      const msg = error.response?.data?.message || 'Ocurrió un error al registrarse. Intentalo de nuevo.'
      setErrorRegistro(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Lado izquierdo (40%) - Branding */}
      <div className="hidden lg:flex w-[40%] bg-slate-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 max-w-md space-y-8">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/20">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-4xl font-display font-bold leading-tight">
            Sumate a la red de profesionales de salud
          </h2>
          
          <p className="text-slate-400 text-lg">
            Empezá a gestionar tus turnos hoy mismo y olvidate del ausentismo.
          </p>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500">✓</div>
              <span className="text-slate-300">Perfil público personalizado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500">✓</div>
              <span className="text-slate-300">Gestión de historia clínica simple</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500">✓</div>
              <span className="text-slate-300">Soporte prioritario</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho (60%) - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-display font-bold text-slate-900">
              Turno<span className="text-emerald-500">Salud</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-slate-900">Creá tu cuenta</h1>
            <p className="text-slate-500">Completá tus datos para empezar.</p>
          </div>

          {errorRegistro && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorRegistro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(procesarRegistro)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Juan"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${errors.nombre ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('nombre')}
                />
                {errors.nombre && <span className="text-xs text-red-500">{errors.nombre.message}</span>}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  placeholder="Pérez"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${errors.apellido ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('apellido')}
                />
                {errors.apellido && <span className="text-xs text-red-500">{errors.apellido.message}</span>}
              </div>
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="especialidad">Especialidad</label>
              <input
                id="especialidad"
                type="text"
                placeholder="Ej: Kinesiología, Odontología..."
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${errors.especialidad ? 'border-red-500' : 'border-slate-200'}`}
                {...register('especialidad')}
              />
              {errors.especialidad && <span className="text-xs text-red-500">{errors.especialidad.message}</span>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                {...register('email')}
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 pr-10 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
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

             {/* Confirm Password */}
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                  id="confirmPassword"
                  type="password"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                  {...register('confirmPassword')}
                />
              {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 mt-4"
            >
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">¿Ya tenés cuenta?</span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/profesional/login" className="text-sm font-medium text-slate-900 underline hover:text-slate-700">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
