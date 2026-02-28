import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, ArrowRight, X } from "lucide-react";

// ── Mock data ────────────────────────────────────────────────────────────────
const profesionalMock = {
  nombre: "Martín García",
  especialidad: "Médico Clínico",
  duracionTurno: 30,
  precio: null, // null = sin precio visible
};

// Días con disponibilidad (YYYY-MM-DD) y sus horarios
const disponibilidadMock = {
  "2026-02-27": ["09:00", "09:30", "10:00", "11:00", "11:30"],
  "2026-03-02": ["09:00", "09:30", "10:00", "10:30"],
  "2026-03-03": ["14:00", "14:30", "15:00", "15:30"],
  "2026-03-04": ["09:00", "09:30", "10:00", "11:00"],
  "2026-03-05": ["14:00", "15:00", "15:30", "16:00"],
  "2026-03-06": ["09:00", "09:30", "10:00"],
  "2026-03-09": ["09:00", "10:00", "10:30", "11:00"],
  "2026-03-10": ["14:30", "15:00", "15:30"],
  "2026-03-11": ["09:00", "09:30", "11:00", "11:30"],
  "2026-03-12": ["14:00", "14:30", "16:00"],
  "2026-03-13": ["09:00", "09:30", "10:00"],
  "2026-03-17": ["09:00", "09:30", "10:00", "10:30"],
  "2026-03-18": ["14:00", "14:30", "15:00"],
  "2026-03-19": ["09:00", "10:00", "11:00"],
  "2026-03-24": ["09:30", "10:00", "10:30"],
  "2026-03-25": ["14:00", "15:30", "16:00"],
  "2026-03-26": ["09:00", "09:30"],
};

// Horarios "ocupados" por fecha
const ocupadosMock = {
  "2026-03-04": ["09:30"],
  "2026-03-11": ["09:30"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function CalendarioReservaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const cells = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMes() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setFechaSeleccionada(null);
    setHorarioSeleccionado(null);
  }

  function nextMes() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setFechaSeleccionada(null);
    setHorarioSeleccionado(null);
  }

  function seleccionarFecha(day) {
    if (!day) return;
    const key = toKey(viewYear, viewMonth, day);
    const isPast = key < todayKey;
    const tieneHorarios = !!disponibilidadMock[key];
    if (isPast || !tieneHorarios) return;
    setFechaSeleccionada(key);
    setHorarioSeleccionado(null);
  }

  function confirmar() {
    if (!fechaSeleccionada || !horarioSeleccionado) return;
    navigate(`/${slug}/reservar/formulario?fecha=${fechaSeleccionada}&hora=${horarioSeleccionado}`);
  }

  const horariosDelDia = fechaSeleccionada ? (disponibilidadMock[fechaSeleccionada] || []) : [];
  const ocupadosDelDia = fechaSeleccionada ? (ocupadosMock[fechaSeleccionada] || []) : [];

  // Label fecha
  const fechaLabel = fechaSeleccionada
    ? new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;

  return (
    <div
      className="h-screen flex flex-col bg-white overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="shrink-0 h-14 border-b border-gray-100 flex items-center px-4 gap-3">
        <button
          onClick={() => navigate(`/${slug}`)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
          MG
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
            Dr. {profesionalMock.nombre}
          </p>
          <p className="text-xs text-gray-400 leading-tight">
            {profesionalMock.especialidad} · Seleccioná un turno
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Calendario (izquierda) ── */}
        <div className="w-full sm:w-96 shrink-0 border-r border-gray-100 flex flex-col p-5 overflow-y-auto">

          {/* Nav mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMes}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {MESES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMes}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grilla días */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;

              const key = toKey(viewYear, viewMonth, day);
              const isPast = key < todayKey;
              const isToday = key === todayKey;
              const tieneHorarios = !!disponibilidadMock[key];
              const isSelected = key === fechaSeleccionada;
              const isDisabled = isPast || !tieneHorarios;

              return (
                <button
                  key={key}
                  onClick={() => seleccionarFecha(day)}
                  disabled={isDisabled}
                  className={`
                    relative mx-auto w-9 h-9 rounded-lg text-sm font-medium flex flex-col items-center justify-center transition-all
                    ${isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                    }
                  `}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                  {tieneHorarios && !isDisabled && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-blue-300 shrink-0" />
              Días con disponibilidad
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              Hoy
            </div>
          </div>
        </div>

        {/* ── Horarios (derecha) ── */}
        <div className="flex-1 flex flex-col overflow-hidden hidden sm:flex">
          {fechaSeleccionada ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                  Horarios disponibles
                </p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {fechaLabel}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {horariosDelDia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Clock size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      No hay turnos disponibles para este día
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Probá seleccionando otro día del calendario
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {horariosDelDia.map(h => {
                      const ocupado = ocupadosDelDia.includes(h);
                      const selected = horarioSeleccionado === h;
                      return (
                        <button
                          key={h}
                          disabled={ocupado}
                          onClick={() => !ocupado && setHorarioSeleccionado(h)}
                          className={`
                            py-3 rounded-xl text-sm font-semibold transition-all border relative
                            ${ocupado
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                              : selected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                            }
                          `}
                        >
                          {h}
                          {ocupado && (
                            <span className="absolute top-1 right-1">
                              <X size={10} className="text-gray-300" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div
                className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4"
              >
                <Clock size={24} className="text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Seleccioná un día
              </p>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Los días resaltados tienen turnos disponibles. Hacé clic en uno para ver los horarios.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="shrink-0 h-14 border-t border-gray-100 flex items-center px-4 gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={13} />
          <span>{profesionalMock.duracionTurno} min por consulta</span>
        </div>

        {profesionalMock.precio && (
          <div className="text-xs text-gray-400">
            · <span className="text-gray-600 font-medium">${profesionalMock.precio}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Resumen selección */}
        {fechaSeleccionada && horarioSeleccionado && (
          <div className="text-xs text-gray-500 hidden sm:block">
            <span className="capitalize">{fechaLabel}</span>
            <span className="font-semibold text-gray-800"> · {horarioSeleccionado}</span>
          </div>
        )}

        <button
          onClick={confirmar}
          disabled={!fechaSeleccionada || !horarioSeleccionado}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
            ${fechaSeleccionada && horarioSeleccionado
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Confirmar horario
          <ArrowRight size={14} />
        </button>
      </footer>
    </div>
  );
}