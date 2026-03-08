import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Mail,
  Bell,
  Link2,
  CalendarPlus,
  Settings,
  Loader2, 
  AlertCircle
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generarICS(fecha, hora, profesional, referencia) {
  if (!fecha || !hora || !profesional) return;

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  const duracion = profesional.duracionTurno || 30;

  function pad(n) { return String(n).padStart(2, "0"); }

  const dtStart = `${anio}${pad(mes)}${pad(dia)}T${pad(hh)}${pad(mm)}00`;
  const endDate = new Date(anio, mes - 1, dia, hh, mm + duracion);
  const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  
  const nombreCompleto = `${profesional.nombre} ${profesional.apellido}`;
  const ubicacion = profesional.modalidad === "Virtual" ? "Virtual" : (profesional.direccion || "Consultorio");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TurnoSalud//ES",
    "BEGIN:VEVENT",
    `UID:${referencia}@turnosalud.app`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Turno con Dr. ${nombreCompleto}`,
    `DESCRIPTION:${profesional.especialidad} · ${duracion} min`,
    `LOCATION:${ubicacion}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `turno-${referencia}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function TurnoConfirmadoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const fecha = searchParams.get("fecha");
  const hora = searchParams.get("hora");
  const referencia = location.state?.referencia;

  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfesional = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/api/publico/${slug}`);
        if (data.ok) {
           setProfesional(data.data);
        } else {
           setError("No se pudo cargar la información del profesional.");
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión");
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
     );
  }

  if (error || !profesional) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
           <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
           <p className="text-gray-600">{error || "Profesional no encontrado"}</p>
           <button onClick={() => navigate("/")} className="mt-4 text-blue-600 underline">Volver al inicio</button>
        </div>
     );
  }

  const initials = `${profesional.nombre?.[0] || ""}${profesional.apellido?.[0] || ""}`.toUpperCase();

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <div className="w-full max-w-md space-y-5">

        {/* ── Checkmark animado ── */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-6">
            <style>{`
              @keyframes pop-in {
                0% { transform: scale(0); opacity: 0; }
                70% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes ring-expand {
                0% { transform: scale(0.8); opacity: 0.8; }
                100% { transform: scale(1.6); opacity: 0; }
              }
              .check-pop { animation: pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
              .ring-1 { animation: ring-expand 1s ease-out 0.3s forwards; }
              .ring-2 { animation: ring-expand 1s ease-out 0.55s forwards; }
            `}</style>

            <span className="ring-1 absolute inset-0 rounded-full bg-green-300 opacity-0" />
            <span className="ring-2 absolute inset-0 rounded-full bg-green-200 opacity-0" />
            <div className="check-pop absolute inset-0 flex items-center justify-center opacity-0">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle2 size={36} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <span className="text-xs font-bold tracking-widest text-green-500 uppercase mb-2">
            Confirmado
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Turno confirmado!
          </h1>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Tu turno quedó reservado. Te enviamos los detalles por email.
          </p>
        </div>

        {/* ── Card detalles ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 border-b border-green-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Dr./a. {profesional.nombre} {profesional.apellido}
              </p>
              <p className="text-xs text-gray-500">{profesional.especialidad}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                Confirmado
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Calendar size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {formatFecha(fecha)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Hora</p>
                <p className="text-sm font-semibold text-gray-800">{hora} hs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              {profesional.modalidad === "Virtual" ? (
                <Video size={15} className="text-blue-400 shrink-0" />
              ) : (
                <MapPin size={15} className="text-blue-400 shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-400">Modalidad</p>
                <p className="text-sm font-semibold text-gray-800">
                  {profesional.modalidad === "Virtual"
                    ? "Videollamada"
                    : "Presencial"}
                </p>
                {profesional.modalidad !== "Virtual" && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {profesional.direccion || "Dirección no configurada"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Duración</p>
                <p className="text-sm font-semibold text-gray-800">
                  {profesional.duracionTurno} minutos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Qué sigue ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            ¿Qué sigue?
          </p>
          {[
            { icon: Mail, text: "Vas a recibir un email de confirmación con todos los detalles." },
            { icon: Bell, text: "Te enviaremos recordatorios antes del turno por WhatsApp y email." },
            { icon: Link2, text: "Podés gestionar o cancelar tu turno desde el link que te enviamos." },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={12} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ── Número de referencia ── */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Número de turno:{" "}
            <span className="font-mono font-semibold text-gray-600">
              #{referencia || "---"}
            </span>
          </p>
        </div>

        {/* ── Botones ── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => generarICS(fecha, hora, profesional, referencia)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <CalendarPlus size={15} />
            Agregar al calendario
          </button>

          <button
            onClick={() => navigate(`/${slug}/gestion`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings size={15} />
            Gestionar mi turno
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-blue-600">TurnoSalud</span>
        </p>
      </div>
    </div>
  );
}