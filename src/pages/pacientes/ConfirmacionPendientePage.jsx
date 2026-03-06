import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Mail, Phone, Calendar, Clock, Bell, Home } from "lucide-react";

function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ConfirmacionPendientePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { turno, paciente, profesional } = location.state || {};

  // Si alguien entra directo a la URL sin state
  if (!turno || !paciente || !profesional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No se encontró información del turno.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <div className="w-full max-w-md space-y-5">

        {/* Ícono */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="relative w-20 h-20 mb-6">
            <span className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-60" />
            <span className="absolute inset-0 rounded-full bg-amber-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-9 h-9 text-amber-500"
                style={{ animation: "spin-slow 4s linear infinite" }}
              >
                <style>{`
                  @keyframes spin-slow { 0% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } 100% { transform: rotate(180deg); } }
                `}</style>
                <path
                  d="M5 3h14M5 21h14M12 12 6.5 6.5A7 7 0 0 1 17.5 6.5L12 12Zm0 0 5.5 5.5A7 7 0 0 1 6.5 17.5L12 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-2">
            Pendiente de confirmación
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tu solicitud fue recibida
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            El/La Dr/a{" "}
            <span className="font-semibold text-gray-700">
              {profesional.nombre}
            </span>{" "}
            revisará tu solicitud y te confirmará el turno a la brevedad.
          </p>
        </div>

        {/* Card resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Resumen de tu solicitud
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Calendar size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Fecha solicitada</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {formatFecha(turno.fecha)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Horario</p>
                <p className="text-sm font-semibold text-gray-800">
                  {turno.horaInicio} hs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-500 font-bold text-xs leading-none">
                  P
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Paciente</p>
                <p className="text-sm font-semibold text-gray-800">
                  {paciente.nombre} {paciente.apellido}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Mail size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-800">
                  {paciente.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Phone size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm font-semibold text-gray-800">
                  {paciente.telefono}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificación */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5">
          <Bell size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Te avisaremos por{" "}
            <span className="font-semibold">email y WhatsApp</span> cuando tu
            turno sea confirmado por el profesional.
          </p>
        </div>

        {/* Número de referencia real */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Número de referencia:{" "}
            <span className="font-mono font-semibold text-gray-600">
              #{turno.referencia}
            </span>
          </p>
        </div>

        {/* Botón volver */}
        <button
          onClick={() => navigate(`/${slug}`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Home size={15} />
          Volver al inicio
        </button>

        <p className="text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-blue-600">TurnoSalud</span>
        </p>
      </div>
    </div>
  );
}