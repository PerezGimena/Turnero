import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, Calendar, Mail, Phone,
  User, Filter, ChevronDown, X, AlertCircle, Search,
  MapPin, Video, History, ChevronRight,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const pendientesMock = [
  {
    id: 1, paciente: "Juan Pérez", email: "juanperez@email.com", telefono: "+54 11 1234-5678",
    fecha: "2026-03-04", hora: "14:30", duracion: 30, modalidad: "Presencial",
    motivo: "Consulta de control general", obraSocial: "OSDE", hace: "hace 2 horas",
    historialTurnos: [
      { fecha: "2025-11-10", estado: "CONFIRMADO", motivo: "Control rutinario" },
      { fecha: "2025-08-22", estado: "CONFIRMADO", motivo: "Chequeo anual" },
    ],
  },
  {
    id: 2, paciente: "Laura Martínez", email: "laura.m@gmail.com", telefono: "+54 351 555-0011",
    fecha: "2026-03-04", hora: "15:00", duracion: 30, modalidad: "Virtual",
    motivo: null, obraSocial: "Swiss Medical", hace: "hace 4 horas",
    historialTurnos: [],
  },
  {
    id: 3, paciente: "Hernán Díaz", email: "hernan.d@hotmail.com", telefono: "+54 11 8899-1122",
    fecha: "2026-03-05", hora: "09:00", duracion: 30, modalidad: "Presencial",
    motivo: "Resultado de análisis de sangre", obraSocial: "PAMI", hace: "hace 6 horas",
    historialTurnos: [
      { fecha: "2025-12-01", estado: "CANCELADO", motivo: "Análisis de sangre" },
    ],
  },
  {
    id: 4, paciente: "Sofía Romero", email: "sofi.romero@icloud.com", telefono: "+54 11 7766-3344",
    fecha: "2026-03-06", hora: "10:30", duracion: 30, modalidad: "Virtual",
    motivo: "Primera consulta", obraSocial: "Galeno", hace: "hace 1 día",
    historialTurnos: [],
  },
  {
    id: 5, paciente: "Tomás Villanueva", email: "tomas.v@outlook.com", telefono: "+54 261 444-9900",
    fecha: "2026-03-09", hora: "14:00", duracion: 30, modalidad: "Presencial",
    motivo: "Dolor de cabeza recurrente", obraSocial: "Medifé", hace: "hace 1 día",
    historialTurnos: [
      { fecha: "2025-10-15", estado: "CONFIRMADO", motivo: "Cefalea" },
      { fecha: "2025-07-03", estado: "CONFIRMADO", motivo: "Control" },
      { fecha: "2025-03-18", estado: "CONFIRMADO", motivo: "Primera consulta" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function initials(nombre) {
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const COLORES_AVATAR = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function TurnosPendientesPage() {
  const [turnos, setTurnos] = useState(pendientesMock);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [panelTurno, setPanelTurno] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

  function confirmar(id) {
    setTurnos(ts => ts.filter(t => t.id !== id));
    if (panelTurno?.id === id) setPanelTurno(null);
  }

  function rechazar(id) {
    setTurnos(ts => ts.filter(t => t.id !== id));
    setModalRechazar(null);
    setMotivoRechazo("");
    if (panelTurno?.id === id) setPanelTurno(null);
  }

  async function confirmarTodos() {
    setConfirmandoTodos(true);
    await new Promise(r => setTimeout(r, 900));
    setTurnos([]);
    setPanelTurno(null);
    setConfirmandoTodos(false);
  }

  const filtrados = turnos.filter(t => {
    const matchBusqueda = t.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.obraSocial.toLowerCase().includes(busqueda.toLowerCase());
    return matchBusqueda;
  });

  return (
    <div className="h-full flex bg-slate-50 overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* ── Columna principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">Turnos pendientes</h1>
              {turnos.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {turnos.length}
                </span>
              )}
            </div>
            {turnos.length > 0 && (
              <button onClick={confirmarTodos} disabled={confirmandoTodos}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                <CheckCircle2 size={14} />
                {confirmandoTodos ? "Confirmando..." : "Confirmar todos"}
              </button>
            )}
          </div>

          {/* Barra búsqueda + filtros */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre u obra social..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {[
                { val: "todos", label: "Todos" },
                { val: "fecha", label: "Por fecha" },
                { val: "os", label: "Obra social" },
              ].map(f => (
                <button key={f.val} onClick={() => setFiltro(f.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${filtro === f.val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-bold text-slate-700 mb-1">¡Estás al día!</p>
              <p className="text-sm text-slate-400">No tenés turnos por confirmar.</p>
            </div>
          ) : (
            filtrados.map((turno, idx) => (
              <TurnoCard
                key={turno.id}
                turno={turno}
                colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                onConfirmar={() => confirmar(turno.id)}
                onRechazar={() => setModalRechazar(turno)}
                onVerDetalle={() => setPanelTurno(turno)}
                activo={panelTurno?.id === turno.id}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Panel lateral deslizable ── */}
      {panelTurno && (
        <>
          <div className="fixed inset-0 z-30 lg:hidden bg-black/20" onClick={() => setPanelTurno(null)} />
          <div className="w-80 shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-hidden"
            style={{ animation: "slide-in .18s ease-out" }}>
            <style>{`@keyframes slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Detalle del turno</h2>
              <button onClick={() => setPanelTurno(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Avatar + nombre */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${COLORES_AVATAR[pendientesMock.findIndex(t => t.id === panelTurno.id) % COLORES_AVATAR.length]}`}>
                  {initials(panelTurno.paciente)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{panelTurno.paciente}</p>
                  <p className="text-xs text-slate-400">{panelTurno.obraSocial}</p>
                </div>
              </div>

              {/* Datos contacto */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contacto</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={13} className="text-slate-400 shrink-0" />{panelTurno.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone size={13} className="text-slate-400 shrink-0" />{panelTurno.telefono}
                </div>
              </div>

              {/* Datos turno */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Turno solicitado</p>
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span className="capitalize">{formatFecha(panelTurno.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock size={13} className="text-slate-400 shrink-0" />
                    {panelTurno.hora} hs · {panelTurno.duracion} min
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    {panelTurno.modalidad === "Virtual"
                      ? <Video size={13} className="text-slate-400 shrink-0" />
                      : <MapPin size={13} className="text-slate-400 shrink-0" />}
                    {panelTurno.modalidad}
                  </div>
                  {panelTurno.motivo && (
                    <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-2 mt-1">
                      "{panelTurno.motivo}"
                    </p>
                  )}
                </div>
              </div>

              {/* Historial */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <History size={12} /> Turnos anteriores
                </p>
                {panelTurno.historialTurnos.length === 0 ? (
                  <p className="text-xs text-slate-400">Primera vez que solicita turno.</p>
                ) : (
                  <div className="space-y-2">
                    {panelTurno.historialTurnos.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${h.estado === "CONFIRMADO" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 truncate">{h.motivo || "Sin motivo"}</p>
                          <p className="text-xs text-slate-400">{new Date(h.fecha + "T12:00:00").toLocaleDateString("es-AR")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Acciones panel */}
            <div className="px-5 py-4 border-t border-slate-100 space-y-2">
              <button onClick={() => confirmar(panelTurno.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors">
                <CheckCircle2 size={15} /> Confirmar turno
              </button>
              <button onClick={() => setModalRechazar(panelTurno)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 text-sm font-bold transition-colors">
                <XCircle size={15} /> Rechazar
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Rechazar ── */}
      {modalRechazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalRechazar(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: "modal-in .18s ease-out" }}>
            <style>{`@keyframes modal-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

            <div className="px-6 pt-6 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Rechazar solicitud</h2>
              <p className="text-sm text-slate-500 mb-4">
                Vas a rechazar el turno de{" "}
                <span className="font-semibold text-slate-700">{modalRechazar.paciente}</span>{" "}
                del <span className="capitalize">{formatFecha(modalRechazar.fecha)}</span> a las{" "}
                <span className="font-semibold">{modalRechazar.hora} hs</span>.
              </p>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Motivo del rechazo{" "}
                <span className="text-slate-400 font-normal">— opcional</span>
              </label>
              <textarea
                rows={3}
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                placeholder="Ej: No tengo disponibilidad en ese horario..."
                className="w-full rounded-xl border border-slate-200 text-sm px-3 py-2.5 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                El paciente recibirá una notificación con este motivo.
              </p>
            </div>

            <div className="flex gap-2 px-6 pb-5">
              <button onClick={() => setModalRechazar(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => rechazar(modalRechazar.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                Rechazar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Card individual ───────────────────────────────────────────────────────────
function TurnoCard({ turno, colorAvatar, onConfirmar, onRechazar, onVerDetalle, activo }) {
  return (
    <div
      onClick={onVerDetalle}
      className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md
        ${activo ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-100 hover:border-slate-200"}`}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorAvatar}`}>
          {initials(turno.paciente)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-bold text-slate-800">{turno.paciente}</p>
            <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
              {turno.obraSocial}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2">
            {turno.email} · {turno.telefono}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Calendar size={11} className="text-slate-400" />
              <span className="capitalize">{formatFecha(turno.fecha)}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Clock size={11} className="text-slate-400" />
              {turno.hora} hs · {turno.duracion} min
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-600">
              {turno.modalidad === "Virtual"
                ? <Video size={11} className="text-slate-400" />
                : <MapPin size={11} className="text-slate-400" />}
              {turno.modalidad}
            </span>
          </div>

          {turno.motivo && (
            <p className="text-xs text-slate-400 italic mt-1.5">
              "{turno.motivo}"
            </p>
          )}

          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <Clock size={10} /> Solicitado {turno.hace}
          </p>
        </div>

        {/* Acciones */}
        <div className="shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={onConfirmar}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl transition-colors">
            <CheckCircle2 size={13} /> Confirmar
          </button>
          <button onClick={onRechazar}
            className="w-8 h-8 rounded-xl border border-red-200 hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
            <XCircle size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}