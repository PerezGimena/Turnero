import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Shield,
  ChevronRight,
  CheckCircle2,
  Star,
  Video,
  Building2,
  ArrowRight,
} from "lucide-react";

import { useNavigate, useParams } from 'react-router-dom'

const profesionalPublico = {
  nombre: "Martín García",
  especialidad: "Médico Clínico",
  descripcion:
    "Más de 12 años de experiencia en medicina clínica y preventiva. Atención personalizada, escucha activa y diagnóstico integral para tu bienestar.",
  modalidad: "Ambas",
  duracionTurno: 30,
  obrasSociales: ["OSDE", "Swiss Medical", "Galeno", "PAMI", "Medifé"],
  diasAtencion: [
    { dia: "Lunes", horarios: ["9:00", "9:30", "10:00", "10:30", "11:00"] },
    { dia: "Martes", horarios: ["14:00", "14:30", "15:00", "15:30"] },
    { dia: "Miércoles", horarios: ["9:00", "9:30", "10:00", "11:00", "11:30"] },
    { dia: "Jueves", horarios: ["14:00", "15:00", "15:30", "16:00"] },
    { dia: "Viernes", horarios: ["9:00", "9:30", "10:00"] },
  ],
  ubicacion: "Av. Corrientes 1234, CABA",
  calificacion: 4.9,
  totalReseñas: 128,
};

const pasos = [
  {
    num: "01",
    titulo: "Elegí tu horario",
    desc: "Seleccioná el día y la hora que mejor se adapte a tu rutina.",
    icon: Calendar,
  },
  {
    num: "02",
    titulo: "Ingresá tus datos",
    desc: "Completá un formulario breve con tu información y obra social.",
    icon: Shield,
  },
  {
    num: "03",
    titulo: "Confirmación al instante",
    desc: "Recibís un email y recordatorio del turno confirmado.",
    icon: CheckCircle2,
  },
];

export default function LandingProfesionalPage() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const diaActivo = profesionalPublico.diasAtencion.find(
    (d) => d.dia === diaSeleccionado
  );

  const navigate = useNavigate()
  const { slug } = useParams()

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Header Sticky ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              TurnoSalud
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {profesionalPublico.nombre}
            </span>
            <button
  onClick={() => navigate(`/${slug}/reservar`)}
  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
>
  Reservar turno
  <ChevronRight size={14} />
</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* ── Hero ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          {/* Avatar circular */}
          <div className="relative shrink-0">
            <div
              className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-4xl border-4 border-white shadow-md"
              style={{ width: 180, height: 180 }}
            >
              MG
            </div>
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-1">
              {profesionalPublico.especialidad}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dr. {profesionalPublico.nombre}
            </h1>
            <div className="flex items-center gap-1 justify-center sm:justify-start mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">
                {profesionalPublico.calificacion} · {profesionalPublico.totalReseñas} reseñas
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              {profesionalPublico.descripcion}
            </p>
          </div>
        </section>

        {/* ── Info Badges ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Modalidad */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {profesionalPublico.modalidad === "Ambas" ? (
                <>
                  <Building2 size={16} className="text-blue-500" />
                  <Video size={16} className="text-blue-500" />
                </>
              ) : profesionalPublico.modalidad === "Presencial" ? (
                <Building2 size={16} className="text-blue-500" />
              ) : (
                <Monitor size={16} className="text-blue-500" />
              )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
              Modalidad
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {profesionalPublico.modalidad === "Ambas"
                ? "Presencial y Virtual"
                : profesionalPublico.modalidad}
            </p>
            {profesionalPublico.modalidad !== "Virtual" && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} />
                {profesionalPublico.ubicacion}
              </p>
            )}
          </div>

          {/* Duración */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <Clock size={16} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
              Duración del turno
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {profesionalPublico.duracionTurno} minutos
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Por consulta</p>
          </div>

          {/* Obras Sociales */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <Shield size={16} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              Obras sociales
            </p>
            <div className="flex flex-wrap gap-1">
              {profesionalPublico.obrasSociales.slice(0, 3).map((os) => (
                <span
                  key={os}
                  className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full"
                >
                  {os}
                </span>
              ))}
              {profesionalPublico.obrasSociales.length > 3 && (
                <span className="text-xs text-gray-400 font-medium px-1 py-0.5">
                  +{profesionalPublico.obrasSociales.length - 3} más
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Paso a Paso ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            ¿Cómo sacar un turno?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pasos.map((paso, i) => (
              <div key={paso.num} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <paso.icon size={16} className="text-blue-600" />
                  </div>
                  {i < pasos.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-gray-100" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 mb-0.5">
                    {paso.num}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    {paso.titulo}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {paso.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Grilla de Horarios ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Días disponibles
          </h2>
          <p className="text-sm text-gray-400 mb-5">
            Seleccioná un día para ver los horarios.
          </p>

          {/* Chips de días */}
          <div className="flex flex-wrap gap-2 mb-6">
            {profesionalPublico.diasAtencion.map((d) => (
              <button
                key={d.dia}
                onClick={() => {
                  setDiaSeleccionado(d.dia);
                  setHorarioSeleccionado(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  diaSeleccionado === d.dia
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {d.dia}
                <span
                  className={`ml-1.5 text-xs ${
                    diaSeleccionado === d.dia ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {d.horarios.length}
                </span>
              </button>
            ))}
          </div>

          {/* Horarios del día seleccionado */}
          {diaActivo ? (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
                Horarios · {diaActivo.dia}
              </p>
              <div className="flex flex-wrap gap-2">
                {diaActivo.horarios.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorarioSeleccionado(h)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      horarioSeleccionado === h
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 py-8 text-center">
              <Calendar size={22} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Seleccioná un día para ver los turnos disponibles
              </p>
            </div>
          )}
        </section>

        {/* ── CTA Final ── */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">
            ¿Listo para reservar?
          </h2>
          <p className="text-blue-100 text-sm mb-6 max-w-sm mx-auto">
            Confirmá tu turno en menos de 2 minutos, sin llamadas y sin esperar.
          </p>
          <button
  onClick={() => navigate(`/${slug}/reservar`)}
  className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm"
>
  Ver turnos disponibles
  <ArrowRight size={16} />
</button>
          {horarioSeleccionado && diaSeleccionado && (
            <p className="text-blue-200 text-xs mt-4">
              Turno preseleccionado: {diaSeleccionado} a las {horarioSeleccionado}
            </p>
          )}
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="max-w-3xl mx-auto px-4 py-6 border-t border-gray-100 mt-4">
        <p className="text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-blue-600">TurnoSalud</span> · Tu
          salud, sin filas.
        </p>
      </footer>
    </div>
  );
}