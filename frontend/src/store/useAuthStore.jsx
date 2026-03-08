import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      esAutenticado: false,
      rol: null, // 'profesional' | 'admin'
      token: null,

      login: (datosUsuario, token) => set({
        usuario: datosUsuario,
        esAutenticado: true,
        rol: datosUsuario.rol,
        token: token
      }),

      logout: () => set({
        usuario: null,
        esAutenticado: false,
        rol: null,
        token: null
      })
    }),
    {
      name: 'turnosalud-auth', // clave en localStorage
    }
  )
)

export default useAuthStore