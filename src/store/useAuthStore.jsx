import { create } from 'zustand'

const useAuthStore = create((set) => ({
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
}))

export default useAuthStore
