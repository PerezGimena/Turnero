/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html', // <-- ¡Agregá esta línea!
    './src/**/*.{jsx,js}'
  ],
  theme: {
    extend: {
      colors: {
        // Paciente
        paciente: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        // Profesional
        profesional: { DEFAULT: '#10B981', dark: '#059669' },
        // Admin
        admin: { DEFAULT: '#7C3AED', dark: '#6D28D9' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Geist Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

