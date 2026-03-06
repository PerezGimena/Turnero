import { useState, useEffect } from "react";
import axios from "axios";
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
  BadgeCheck,
} from "lucide-react";

import { useNavigate, useParams } from 'react-router-dom';

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

// Helper para generar slots de tiempo
const generateTimeSlots = (start, end, duration) => {
  const slots = [];
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  while (current < endTime) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + duration);
  }
  
  return slots;
};

// Helper para capitalizar días
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function LandingProfesionalPage() {
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const fetchProfesional = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/publico/${slug}`);
        const data = response.data.data;

        // Transformar data del backend al formato del frontend
        const diasConfig = data.diasConfiguracion || [];
        const diasAtencion = diasConfig.map(d => ({
          dia: capitalize(d.dia),
          horarios: generateTimeSlots(d.horaInicio, d.horaFin, data.duracionTurno)
        }));

        // Parsear obras sociales (asumiendo texto separado por comas o saltos)
        const obrasSociales = data.obrasSocialesTexto 
          ? data.obrasSocialesTexto.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
          : [];

        setProfesional({
          nombre: `${data.nombre} ${data.apellido}`,
          especialidad: data.especialidad || "Profesional de la Salud",
          matricula: "", // No viene del back aun
          descripcion: data.descripcion || "Sin descripción disponible.",
          modalidad: capitalize(data.modalidad),
          duracionTurno: data.duracionTurno,
          obrasSociales: obrasSociales.length > 0 ? obrasSociales : ["Particular"],
          diasAtencion: diasAtencion,
          ubicacion: data.direccion || "Consultorio Virtual",
          calificacion: 5.0, // Hardcodeado por ahora
          totalReseñas: 0, // Hardcodeado por ahora
          slug: data.slug
        });

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del profesional.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfesional();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profesional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profesional no encontrado</h2>
          <p className="text-gray-500 mb-6">{error || "El enlace puede estar roto o el perfil no existe."}</p>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-600 font-medium hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const diaActivo = profesional.diasAtencion.find(
    (d) => d.dia === diaSeleccionado
  );

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">TurnoSalud</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {profesional.nombre}
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
        {/* Hero */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-4xl border-4 border-white shadow-md"
              style={{ width: 180, height: 180 }}
            >
              {profesional.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-1">
              {profesional.especialidad}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profesional.nombre}
            </h1>

            {/* Matrícula (Oculta si vacía) */}
            {profesional.matricula && (
              <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-2">
                <BadgeCheck size={14} className="text-blue-500" />
                <span className="text-xs text-gray-500 font-medium">
                  Mat. {profesional.matricula}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 justify-center sm:justify-start mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-gray-500 ml-1">
                {profesional.calificacion} · {profesional.totalReseñas} reseñas
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              {profesional.descripcion}
            </p>
          </div>
        </section>

        {/* Info Badges */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Modalidad */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {(profesional.modalidad === "Ambas" || profesional.modalidad === "Hibrido") ? (
                <>
                  <Building2 size={16} className="text-blue-500" />
                  <Video size={16} className="text-blue-500" />
                </>
              ) : profesional.modalidad === "Presencial" ? (
                <Building2 size={16} className="text-blue-500" />
              ) : (
                <Monitor size={16} className="text-blue-500" />
              )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Modalidad</p>
            <p className="text-sm font-semibold text-gray-800">
              {profesional.modalidad === "Ambas" ? "Presencial y Virtual" : profesional.modalidad}
            </p>
            {profesional.modalidad !== "Virtual" && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} />
                {profesional.ubicacion}
              </p>
            )}
          </div>

          {/* Duración */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <Clock size={16} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Duración del turno</p>
            <p className="text-sm font-semibold text-gray-800">{profesional.duracionTurno} minutos</p>
            <p className="text-xs text-gray-400 mt-0.5">Por consulta</p>
          </div>

          {/* Obras Sociales */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <Shield size={16} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Obras sociales</p>
            <div className="flex flex-wrap gap-1">
              {profesional.obrasSociales.slice(0, 3).map((os) => (
                <span key={os} className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                  {os}
                </span>
              ))}
              {profesional.obrasSociales.length > 3 && (
                <span className="text-xs text-gray-400 font-medium px-1 py-0.5">
                  +{profesional.obrasSociales.length - 3} más
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">¿Cómo sacar un turno?</h2>
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
                  <p className="text-xs font-bold text-blue-600 mb-0.5">{paso.num}</p>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{paso.titulo}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grilla de Horarios */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Días disponibles</h2>
          <p className="text-sm text-gray-400 mb-5">Seleccioná un día para ver los horarios.</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {profesional.diasAtencion.length > 0 ? (
              profesional.diasAtencion.map((d) => (
                <button
                  key={d.dia}
                  onClick={() => { setDiaSeleccionado(d.dia); setHorarioSeleccionado(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    diaSeleccionado === d.dia
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {d.dia}
                  <span className={`ml-1.5 text-xs ${diaSeleccionado === d.dia ? "text-blue-200" : "text-gray-400"}`}>
                    {d.horarios.length}
                  </span>
                </button>
              ))
            ) : (
                <p className="text-sm text-gray-400">El profesional no tiene horarios configurados.</p>
            )}
          </div>

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
            profesional.diasAtencion.length > 0 && (
              <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 py-8 text-center">
                <Calendar size={22} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Seleccioná un día para ver los turnos disponibles</p>
              </div>
            )
          )}
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">¿Listo para reservar?</h2>
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

      <footer className="max-w-3xl mx-auto px-4 py-6 border-t border-gray-100 mt-4">
        <p className="text-center text-xs text-gray-400">
          Powered by <span className="font-semibold text-blue-600">TurnoSalud</span> · Tu salud, sin filas.
        </p>
      </footer>
    </div>
  );
}