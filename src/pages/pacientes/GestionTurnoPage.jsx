import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CalendarPlus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

// ── Mock ──────────────────────────────────────────────────────────────────────
const turnoMock = {
  id: "abc123",
  estado: "CONFIRMADO", // "CONFIRMADO" | "PENDIENTE" | "CANCELADO"
  fecha: "2026-03-11",
  hora: "09:00",
  profesional: {
    nombre: "Martín García",
    especialidad: "Médico Clínico",
    modalidad: "Presencial",
    direccion: "Av. Corrientes 1234, CABA",
    duracionTurno: 30,
    permiteReprogramar: true,
    horasMinCancelacion: 24,
  },
  paciente: {
    nombre: "Lucas Ramírez",
    email: "lucas@email.com",
    telefono: "+54 9 11 12345678",
  },
  motivoCancelacion: null,
  fechaCancelacion: null,
};

// Disponibilidad para reprogramar
const disponibilidadMock = {
  "2026-03-17": ["09:00", "09:30", "10:00", "10:30"],
  "2026-03-18": ["14:00", "14:30", "15:00"],
  "2026-03-19": ["09:00", "10:00", "11:00"],
  "2026-03-24": ["09:30", "10:00", "10:30"],
  "2026-03-25": ["14:00", "15:30", "16:00"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIAS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function toKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function horasHastaFecha(fechaStr, hora) {
  const turno = new Date(`${fechaStr}T${hora}:00`);
  const ahora = new Date();
  return (turno - ahora) / 36e5;
}

function generarICS(turno) {
  const { fecha, hora, profesional } = turno;
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  const pad = n => String(n).padStart(2,"0");
  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  const end = new Date(y, m-1, d, hh, mm + profesional.duracionTurno);
  const dtEnd = `${end.getFullYear()}${pad(end.getMonth()+1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",
    `UID:${turno.id}@turnosalud.app`,`DTSTART:${dtStart}`,`DTEND:${dtEnd}`,
    `SUMMARY:Turno con Dr. ${profesional.nombre}`,
    `LOCATION:${profesional.direccion || "Virtual"}`,
    "END:VEVENT","END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `turno-${turno.id}.ics`; a.click();
  URL.revokeObjectURL(url);
}

// ── Badge estado ──────────────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const cfg = {
    CONFIRMADO: "bg-green-100 text-green-700 border-green-200",
    PENDIENTE:  "bg-amber-100 text-amber-700 border-amber-200",
    CANCELADO:  "bg-red-100 text-red-600 border-red-200",
  };
  const labels = { CONFIRMADO: "Confirmado", PENDIENTE: "Pendiente", CANCELADO: "Cancelado" };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg[estado]}`}>
      {labels[estado]}
    </span>
  );
}

// ── Mini Calendario ───────────────────────────────────────────────────────────
function MiniCalendario({ fechaSeleccionada, onSelect }) {
  const today = new Date();
  const [vy, setVy] = useState(today.getFullYear());
  const [vm, setVm] = useState(today.getMonth());
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
  const cells = useMemo(() => buildCalendar(vy, vm), [vy, vm]);

  function prev() { vm === 0 ? (setVy(y => y-1), setVm(11)) : setVm(m => m-1); }
  function next() { vm === 11 ? (setVy(y => y+1), setVm(0)) : setVm(m => m+1); }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold text-gray-700">{MESES[vm]} {vy}</span>
        <button onClick={next} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DIAS.map(d => <div key={d} className="text-center text-xs text-gray-400 py-0.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = toKey(vy, vm, day);
          const isPast = key < todayKey;
          const tiene = !!disponibilidadMock[key];
          const selected = key === fechaSeleccionada;
          const disabled = isPast || !tiene;
          return (
            <button key={key} disabled={disabled} onClick={() => onSelect(key)}
              className={`mx-auto w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all
                ${selected ? "bg-blue-600 text-white" : disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}>
              {day}
              {tiene && !disabled && !selected && <span className="sr-only">disponible</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Modal base ────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        <style>{`@keyframes animate-in { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } } .animate-in { animation: animate-in 0.2s ease-out; }`}</style>
        {children}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GestionTurnoPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const [turno, setTurno] = useState(turnoMock);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalReprogramar, setModalReprogramar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [nuevoHorario, setNuevoHorario] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const horas = horasHastaFecha(turno.fecha, turno.hora);
  const cancelacionTardia = horas < turno.profesional.horasMinCancelacion && horas > 0;

  async function confirmarCancelacion() {
    setProcesando(true);
    await new Promise(r => setTimeout(r, 1000));
    setTurno(t => ({ ...t, estado: "CANCELADO", motivoCancelacion, fechaCancelacion: new Date().toISOString() }));
    setProcesando(false);
    setModalCancelar(false);
  }

  async function confirmarReprogramacion() {
    if (!nuevaFecha || !nuevoHorario) return;
    setProcesando(true);
    await new Promise(r => setTimeout(r, 1000));
    setTurno(t => ({ ...t, fecha: nuevaFecha, hora: nuevoHorario }));
    setProcesando(false);
    setModalReprogramar(false);
    setNuevaFecha(null);
    setNuevoHorario(null);
  }

  const horariosNuevaFecha = nuevaFecha ? (disponibilidadMock[nuevaFecha] || []) : [];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(`/${slug}`)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <ArrowLeft size={17} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">TurnoSalud</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* ── Card principal ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header card */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                MG
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Dr. {turno.profesional.nombre}</p>
                <p className="text-xs text-gray-500">{turno.profesional.especialidad}</p>
              </div>
            </div>
            <BadgeEstado estado={turno.estado} />
          </div>

          {/* Detalles turno */}
          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Calendar size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{formatFecha(turno.fecha)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Hora</p>
                <p className="text-sm font-semibold text-gray-800">{turno.hora} hs · {turno.profesional.duracionTurno} min</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <MapPin size={15} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Modalidad</p>
                <p className="text-sm font-semibold text-gray-800">{turno.profesional.modalidad}</p>
                <p className="text-xs text-gray-400">{turno.profesional.direccion}</p>
              </div>
            </div>
          </div>

          {/* Datos paciente */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tus datos</p>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <User size={13} className="text-gray-400 shrink-0" />
              {turno.paciente.nombre}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Mail size={13} className="text-gray-400 shrink-0" />
              {turno.paciente.email}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Phone size={13} className="text-gray-400 shrink-0" />
              {turno.paciente.telefono}
            </div>
          </div>

          {/* Info cancelación */}
          {turno.estado === "CANCELADO" && (
            <div className="border-t border-red-100 bg-red-50 px-5 py-4">
              <p className="text-xs font-bold text-red-600 mb-1">Turno cancelado</p>
              {turno.motivoCancelacion && (
                <p className="text-xs text-red-500">Motivo: {turno.motivoCancelacion}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Acciones según estado ── */}
        {turno.estado === "CONFIRMADO" && (
          <div className="space-y-2">
            <button onClick={() => generarICS(turno)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
              <CalendarPlus size={15} />
              Agregar al calendario
            </button>
            {turno.profesional.permiteReprogramar && (
              <button onClick={() => setModalReprogramar(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <RefreshCw size={15} />
                Reprogramar turno
              </button>
            )}
            <button onClick={() => setModalCancelar(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <XCircle size={15} />
              Cancelar turno
            </button>
          </div>
        )}

        {turno.estado === "PENDIENTE" && (
          <button onClick={() => setModalCancelar(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <XCircle size={15} />
            Cancelar solicitud
          </button>
        )}

        {turno.estado === "CANCELADO" && (
          <button onClick={() => navigate(`/${slug}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <PlusCircle size={15} />
            Hacer nueva reserva
          </button>
        )}

        <p className="text-center text-xs text-gray-400 pt-2">
          Powered by <span className="font-semibold text-blue-600">TurnoSalud</span>
        </p>
      </main>

      {/* ── Modal Cancelar ── */}
      {modalCancelar && (
        <Modal onClose={() => setModalCancelar(false)}>
          <div className="px-6 pt-6 pb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">¿Cancelar turno?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tu turno del <span className="font-semibold capitalize">{formatFecha(turno.fecha)}</span> a las <span className="font-semibold">{turno.hora} hs</span> será cancelado.
            </p>

            {cancelacionTardia && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Estás cancelando con menos de <strong>{turno.profesional.horasMinCancelacion} horas</strong> de anticipación. Puede aplicar una política de cancelación.
                </p>
              </div>
            )}

            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Motivo <span className="text-gray-400 font-normal">— opcional</span>
            </label>
            <textarea
              rows={3}
              value={motivoCancelacion}
              onChange={e => setMotivoCancelacion(e.target.value)}
              placeholder="Contanos brevemente por qué cancelás..."
              className="w-full rounded-xl border border-gray-200 text-sm px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>
          <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
            <button onClick={() => setModalCancelar(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Volver
            </button>
            <button onClick={confirmarCancelacion} disabled={procesando}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {procesando ? "Cancelando..." : "Sí, cancelar"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Reprogramar ── */}
      {modalReprogramar && (
        <Modal onClose={() => setModalReprogramar(false)}>
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Reprogramar turno</h2>
                <p className="text-xs text-gray-400 mt-0.5">Seleccioná una nueva fecha y horario</p>
              </div>
              <button onClick={() => setModalReprogramar(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={16} />
              </button>
            </div>

            <MiniCalendario
              fechaSeleccionada={nuevaFecha}
              onSelect={f => { setNuevaFecha(f); setNuevoHorario(null); }}
            />

            {nuevaFecha && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Horarios disponibles
                </p>
                {horariosNuevaFecha.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No hay horarios para este día</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {horariosNuevaFecha.map(h => (
                      <button key={h} onClick={() => setNuevoHorario(h)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all
                          ${nuevoHorario === h ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 px-6 py-4 border-t border-gray-100 mt-2">
            <button onClick={() => setModalReprogramar(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={confirmarReprogramacion} disabled={!nuevaFecha || !nuevoHorario || procesando}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40">
              {procesando ? "Guardando..." : "Confirmar nueva fecha"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}