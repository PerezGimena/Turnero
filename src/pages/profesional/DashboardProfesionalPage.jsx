import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  UserX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Bell,
  Search,
  X,
  User,
  MapPin,
  Video,
  FileText,
  MoreHorizontal,
} from "lucide-react";

// ── Paleta profesional: slate oscuro + verde accent ───────────────────────────
// bg: #0F172A (slate-900), accent: #10B981 (emerald-500)

// ── Mock data ─────────────────────────────────────────────────────────────────
const profesional = {
  nombre: "Martín García",
  especialidad: "Médico Clínico",
};

const metricas = [
  {
    label: "Turnos hoy",
    valor: 8,
    sub: "3 confirmados",
    trend: null,
    icon: Calendar,
    color: "emerald",
  },
  {
    label: "Pendientes",
    valor: 3,
    sub: "Requieren acción",
    trend: null,
    icon: AlertCircle,
    color: "amber",
  },
  {
    label: "Este mes",
    valor: 47,
    sub: "+12% vs anterior",
    trend: "up",
    icon: TrendingUp,
    color: "blue",
  },
  {
    label: "Ausencias mes",
    valor: 5,
    sub: "10.6% · -2% vs ant.",
    trend: "down",
    icon: UserX,
    color: "red",
  },
];

const turnosHoy = [
  { id: 1, hora: "09:00", fin: "09:30", paciente: "Lucas Ramírez", motivo: "Control anual", estado: "CONFIRMADO", modalidad: "Presencial" },
  { id: 2, hora: "09:30", fin: "10:00", paciente: "Ana Gómez", motivo: "Chequeo rutinario", estado: "CONFIRMADO", modalidad: "Virtual" },
  { id: 3, hora: "10:00", fin: "10:30", paciente: "Carlos Méndez", motivo: null, estado: "PENDIENTE", modalidad: "Presencial" },
  { id: 4, hora: "10:30", fin: "11:00", paciente: "María Rodríguez", motivo: "Resultado estudios", estado: "CONFIRMADO", modalidad: "Presencial" },
  { id: 5, hora: "11:00", fin: "11:30", paciente: "Jorge Suárez", motivo: null, estado: "CANCELADO", modalidad: "Virtual" },
  { id: 6, hora: "14:00", fin: "14:30", paciente: "Paula Fernández", motivo: "Primera consulta", estado: "PENDIENTE", modalidad: "Presencial" },
  { id: 7, hora: "14:30", fin: "15:00", paciente: "Roberto Silva", motivo: "Seguimiento", estado: "CONFIRMADO", modalidad: "Presencial" },
  { id: 8, hora: "15:00", fin: "15:30", paciente: "Valentina López", motivo: null, estado: "PENDIENTE", modalidad: "Virtual" },
];

const pendientesConfirmacion = [
  { id: 3, paciente: "Carlos Méndez", hora: "10:00", fecha: "Hoy" },
  { id: 6, paciente: "Paula Fernández", hora: "14:00", fecha: "Hoy" },
  { id: 8, paciente: "Valentina López", hora: "15:00", fecha: "Hoy" },
];

const notificaciones = [
  { id: 1, texto: "Recordatorio enviado a Lucas Ramírez", hace: "hace 2h" },
  { id: 2, texto: "Turno confirmado: Ana Gómez 09:30", hace: "hace 3h" },
  { id: 3, texto: "Jorge Suárez canceló su turno", hace: "hace 5h" },
];

const pacientesAutocomplete = [
  "Lucas Ramírez", "Ana Gómez", "Carlos Méndez",
  "María Rodríguez", "Paula Fernández", "Roberto Silva",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_CFG = {
  CONFIRMADO: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-700" },
  PENDIENTE:  { label: "Pendiente",  cls: "bg-amber-100 text-amber-700" },
  CANCELADO:  { label: "Cancelado",  cls: "bg-red-100 text-red-500" },
};

const COLOR_CFG = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   icon: "bg-amber-100" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    icon: "bg-blue-100" },
  red:     { bg: "bg-red-50",     text: "text-red-500",     icon: "bg-red-100" },
};

function initials(nombre) {
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardProfesionalPage() {
  const navigate = useNavigate();
  const [turnosState, setTurnosState] = useState(turnosHoy);
  const [modalNuevoTurno, setModalNuevoTurno] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);

  // Form nuevo turno
  const [formTurno, setFormTurno] = useState({
    paciente: "", fecha: "", hora: "", modalidad: "Presencial", notas: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const sugerencias = pacientesAutocomplete.filter(p =>
    busqueda.length > 0 && p.toLowerCase().includes(busqueda.toLowerCase())
  );

  function confirmarTurno(id) {
    setTurnosState(ts => ts.map(t => t.id === id ? { ...t, estado: "CONFIRMADO" } : t));
    setMenuAbierto(null);
  }

  function marcarAusente(id) {
    setTurnosState(ts => ts.map(t => t.id === id ? { ...t, estado: "CANCELADO" } : t));
    setMenuAbierto(null);
  }

  function guardarTurno() {
    if (!formTurno.paciente || !formTurno.fecha || !formTurno.hora) return;
    const nuevo = {
      id: Date.now(), hora: formTurno.hora, fin: formTurno.hora,
      paciente: formTurno.paciente, motivo: formTurno.notas || null,
      estado: "CONFIRMADO", modalidad: formTurno.modalidad,
    };
    setTurnosState(ts => [...ts, nuevo].sort((a, b) => a.hora.localeCompare(b.hora)));
    setModalNuevoTurno(false);
    setFormTurno({ paciente: "", fecha: "", hora: "", modalidad: "Presencial", notas: "" });
    setBusqueda("");
  }

  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Topbar ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Buen día, Dr. {profesional.nombre.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-slate-400 capitalize">{hoy}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
          <button
            onClick={() => setModalNuevoTurno(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Nuevo turno
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Métricas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((m) => {
            const cfg = COLOR_CFG[m.color];
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${cfg.icon} flex items-center justify-center`}>
                    <Icon size={16} className={cfg.text} />
                  </div>
                  {m.trend === "up" && <TrendingUp size={14} className="text-emerald-500" />}
                  {m.trend === "down" && <TrendingDown size={14} className="text-red-400" />}
                </div>
                <p className={`text-3xl font-bold text-slate-900 mb-0.5`}>{m.valor}</p>
                <p className="text-xs font-semibold text-slate-500">{m.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Cuerpo principal ── */}
        <div className="flex gap-5 items-start">

          {/* ── Agenda del día ── */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Agenda de hoy</h2>
              <button
                onClick={() => navigate("/profesional/agenda")}
                className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
              >
                Ver agenda completa <ChevronRight size={13} />
              </button>
            </div>

            {turnosState.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 flex flex-col items-center text-center">
                <Calendar size={28} className="text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-500">No tenés turnos para hoy</p>
                <p className="text-xs text-slate-400 mt-1">Podés crear un turno manual desde el botón superior</p>
              </div>
            ) : (
              <div className="space-y-2">
                {turnosState.map((turno) => {
                  const est = ESTADO_CFG[turno.estado];
                  return (
                    <div
                      key={turno.id}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                        ${turno.estado === "CANCELADO" ? "border-slate-100 opacity-60" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Hora */}
                        <div className="shrink-0 text-center w-14">
                          <p className="text-sm font-bold text-slate-800">{turno.hora}</p>
                          <p className="text-xs text-slate-400">{turno.fin}</p>
                        </div>

                        {/* Separador vertical */}
                        <div className={`w-0.5 h-10 rounded-full shrink-0 ${
                          turno.estado === "CONFIRMADO" ? "bg-emerald-400" :
                          turno.estado === "PENDIENTE" ? "bg-amber-400" : "bg-slate-200"
                        }`} />

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {initials(turno.paciente)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800">{turno.paciente}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${est.cls}`}>
                              {est.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {turno.motivo && (
                              <p className="text-xs text-slate-400 truncate">{turno.motivo}</p>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                              {turno.modalidad === "Virtual"
                                ? <Video size={11} />
                                : <MapPin size={11} />
                              }
                              {turno.modalidad}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {turno.estado === "PENDIENTE" && (
                            <button
                              onClick={() => confirmarTurno(turno.id)}
                              className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={13} />
                              Confirmar
                            </button>
                          )}
                          {turno.estado === "CONFIRMADO" && (
                            <button
                              onClick={() => marcarAusente(turno.id)}
                              className="flex items-center gap-1 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <UserX size={13} />
                              Ausente
                            </button>
                          )}
                          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                            <MoreHorizontal size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Sidebar derecho ── */}
          <div className="w-72 shrink-0 space-y-4">

            {/* Pendientes de confirmación */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Por confirmar
                </h3>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendientesConfirmacion.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {pendientesConfirmacion.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                      {initials(p.paciente)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{p.paciente}</p>
                      <p className="text-xs text-slate-400">{p.fecha} · {p.hora}</p>
                    </div>
                    <button
                      onClick={() => confirmarTurno(p.id)}
                      className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón nuevo turno manual */}
            <button
              onClick={() => setModalNuevoTurno(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-all"
            >
              <Plus size={16} />
              Crear turno manual
            </button>

            {/* Últimas notificaciones */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Notificaciones recientes
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {notificaciones.map((n) => (
                  <div key={n.id} className="px-4 py-3">
                    <p className="text-xs text-slate-600 leading-relaxed">{n.texto}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.hace}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Onboarding tip */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white">
              <p className="text-xs font-bold text-emerald-400 mb-1">💡 Tip</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Configurá tus horarios de atención para que los pacientes puedan reservar automáticamente.
              </p>
              <button
                onClick={() => navigate("/profesional/recordatorios")}
                className="mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Ir a configuración <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Nuevo Turno ── */}
      {modalNuevoTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalNuevoTurno(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "modal-in 0.2s ease-out" }}>
            <style>{`@keyframes modal-in { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Nuevo turno manual</h2>
              <button onClick={() => setModalNuevoTurno(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body modal */}
            <div className="px-6 py-5 space-y-4">

              {/* Buscar paciente */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Paciente <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={busqueda || formTurno.paciente}
                    onChange={e => { setBusqueda(e.target.value); setFormTurno(f => ({ ...f, paciente: "" })); }}
                    placeholder="Buscá por nombre..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  {sugerencias.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {sugerencias.map(s => (
                        <button key={s} onClick={() => { setFormTurno(f => ({ ...f, paciente: s })); setBusqueda(""); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 text-sm text-slate-700 text-left transition-colors">
                          <User size={13} className="text-slate-400" /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formTurno.paciente && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 size={11} /> {formTurno.paciente}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha <span className="text-emerald-500">*</span></label>
                  <input type="date" value={formTurno.fecha}
                    onChange={e => setFormTurno(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hora <span className="text-emerald-500">*</span></label>
                  <input type="time" value={formTurno.hora}
                    onChange={e => setFormTurno(f => ({ ...f, hora: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Modalidad</label>
                <div className="flex gap-2">
                  {["Presencial", "Virtual"].map(m => (
                    <button key={m} onClick={() => setFormTurno(f => ({ ...f, modalidad: m }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                        ${formTurno.modalidad === m ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Notas <span className="text-slate-400 font-normal">— opcional</span>
                </label>
                <textarea rows={2} value={formTurno.notas}
                  onChange={e => setFormTurno(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Motivo, indicaciones previas..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none" />
              </div>
            </div>

            {/* Footer modal */}
            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={guardarTurno}
                disabled={!formTurno.paciente || !formTurno.fecha || !formTurno.hora}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                <CheckCircle2 size={15} />
                Guardar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}