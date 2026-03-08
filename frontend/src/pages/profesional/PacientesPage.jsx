import { useState, useMemo } from "react";
import {
  Search, Plus, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  User, Mail, Phone, Calendar, Clock, Shield, TrendingUp,
  CheckCircle2, XCircle, AlertCircle, CalendarPlus, MessageSquare,
  ChevronsUpDown,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const pacientesMock = [
  { id: 1, nombre: "Lucas Ramírez", email: "lucas@email.com", telefono: "+54 9 11 1234-5678", dni: "32456789", obraSocial: "OSDE", totalTurnos: 8, ausencias: 1, ultimoTurno: "2026-02-15", proximoTurno: "2026-03-11", historial: [
    { fecha: "2026-02-15", hora: "09:00", estado: "CONFIRMADO", motivo: "Control anual" },
    { fecha: "2025-11-10", hora: "10:30", estado: "CONFIRMADO", motivo: "Chequeo rutinario" },
    { fecha: "2025-08-22", hora: "09:00", estado: "AUSENTE", motivo: "Control" },
    { fecha: "2025-05-14", hora: "14:00", estado: "CONFIRMADO", motivo: "Resultado estudios" },
  ]},
  { id: 2, nombre: "Ana Gómez", email: "ana.gomez@gmail.com", telefono: "+54 9 11 9876-5432", dni: "40123456", obraSocial: "Swiss Medical", totalTurnos: 3, ausencias: 0, ultimoTurno: "2026-01-20", proximoTurno: null, historial: [
    { fecha: "2026-01-20", hora: "09:30", estado: "CONFIRMADO", motivo: "Primera consulta" },
    { fecha: "2025-10-05", hora: "11:00", estado: "CONFIRMADO", motivo: "Seguimiento" },
    { fecha: "2025-07-18", hora: "09:00", estado: "CANCELADO", motivo: "Chequeo" },
  ]},
  { id: 3, nombre: "Carlos Méndez", email: "carlos.m@hotmail.com", telefono: "+54 9 351 555-0011", dni: null, obraSocial: null, totalTurnos: 5, ausencias: 2, ultimoTurno: "2026-02-28", proximoTurno: "2026-03-04", historial: [
    { fecha: "2026-02-28", hora: "10:00", estado: "CONFIRMADO", motivo: "Control" },
    { fecha: "2025-12-15", hora: "14:30", estado: "AUSENTE", motivo: "Análisis" },
    { fecha: "2025-09-20", hora: "09:00", estado: "AUSENTE", motivo: "Seguimiento" },
  ]},
  { id: 4, nombre: "María Rodríguez", email: "maria.r@icloud.com", telefono: "+54 9 11 4455-6677", dni: "28901234", obraSocial: "Galeno", totalTurnos: 12, ausencias: 1, ultimoTurno: "2026-02-10", proximoTurno: "2026-03-05", historial: [
    { fecha: "2026-02-10", hora: "09:30", estado: "CONFIRMADO", motivo: "Control anual" },
    { fecha: "2025-11-02", hora: "10:00", estado: "CONFIRMADO", motivo: "Resultado estudios" },
    { fecha: "2025-08-18", hora: "14:00", estado: "AUSENTE", motivo: "Chequeo" },
  ]},
  { id: 5, nombre: "Jorge Suárez", email: "jorge.s@outlook.com", telefono: "+54 9 11 7788-9900", dni: "35678901", obraSocial: "PAMI", totalTurnos: 6, ausencias: 3, ultimoTurno: "2025-12-01", proximoTurno: null, historial: [
    { fecha: "2025-12-01", hora: "11:00", estado: "CANCELADO", motivo: "Primera consulta" },
    { fecha: "2025-09-10", hora: "09:00", estado: "AUSENTE", motivo: "Control" },
    { fecha: "2025-06-22", hora: "14:30", estado: "AUSENTE", motivo: "Análisis" },
  ]},
  { id: 6, nombre: "Paula Fernández", email: "paula.f@gmail.com", telefono: "+54 9 261 444-3322", dni: "38234567", obraSocial: "Medifé", totalTurnos: 4, ausencias: 0, ultimoTurno: "2026-02-20", proximoTurno: "2026-03-06", historial: [
    { fecha: "2026-02-20", hora: "14:00", estado: "CONFIRMADO", motivo: "Seguimiento" },
    { fecha: "2025-11-15", hora: "09:30", estado: "CONFIRMADO", motivo: "Control" },
  ]},
  { id: 7, nombre: "Roberto Silva", email: "roberto.s@yahoo.com", telefono: "+54 9 11 3344-5566", dni: "29876543", obraSocial: "OSDE", totalTurnos: 9, ausencias: 0, ultimoTurno: "2026-02-25", proximoTurno: "2026-03-11", historial: [
    { fecha: "2026-02-25", hora: "14:30", estado: "CONFIRMADO", motivo: "Control anual" },
    { fecha: "2025-10-30", hora: "09:00", estado: "CONFIRMADO", motivo: "Resultado estudios" },
  ]},
  { id: 8, nombre: "Valentina López", email: "vale.lopez@gmail.com", telefono: "+54 9 11 8899-1122", dni: "42345678", obraSocial: null, totalTurnos: 2, ausencias: 1, ultimoTurno: "2025-11-05", proximoTurno: "2026-03-09", historial: [
    { fecha: "2025-11-05", hora: "15:00", estado: "AUSENTE", motivo: "Primera consulta" },
    { fecha: "2025-08-12", hora: "09:00", estado: "CONFIRMADO", motivo: "Consulta" },
  ]},
];

const POR_PAGINA = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(n) { return n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase(); }
function formatFecha(f) {
  if (!f) return "—";
  return new Date(f + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
function tasaAsistencia(total, ausencias) {
  if (!total) return "—";
  return `${Math.round(((total - ausencias) / total) * 100)}%`;
}

const COLORES = ["bg-blue-100 text-blue-700","bg-violet-100 text-violet-700","bg-rose-100 text-rose-700","bg-amber-100 text-amber-700","bg-teal-100 text-teal-700","bg-indigo-100 text-indigo-700","bg-pink-100 text-pink-700","bg-cyan-100 text-cyan-700"];

const ESTADO_CFG = {
  CONFIRMADO: { cls: "text-emerald-600", dot: "bg-emerald-500", label: "Asistió" },
  AUSENTE:    { cls: "text-red-500",     dot: "bg-red-400",     label: "Ausente" },
  CANCELADO:  { cls: "text-slate-400",   dot: "bg-slate-300",   label: "Cancelado" },
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function PacientesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [ordenCol, setOrdenCol] = useState("nombre");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [panelPaciente, setPanelPaciente] = useState(null);
  const [modalAgregar, setModalAgregar] = useState(false);

  // Filtrado + búsqueda
  const filtrados = useMemo(() => {
    let lista = [...pacientesMock];
    if (busqueda) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.telefono.includes(q) ||
        (p.dni && p.dni.includes(q))
      );
    }
    if (filtro === "activos") lista = lista.filter(p => p.proximoTurno);
    if (filtro === "ausencias") lista = lista.filter(p => p.ausencias > 0);

    // Ordenamiento
    lista.sort((a, b) => {
      let va = a[ordenCol], vb = b[ordenCol];
      if (typeof va === "string") va = va?.toLowerCase() ?? "";
      if (typeof vb === "string") vb = vb?.toLowerCase() ?? "";
      va = va ?? -Infinity; vb = vb ?? -Infinity;
      if (va < vb) return ordenDir === "asc" ? -1 : 1;
      if (va > vb) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });
    return lista;
  }, [busqueda, filtro, ordenCol, ordenDir]);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function ordenar(col) {
    if (ordenCol === col) setOrdenDir(d => d === "asc" ? "desc" : "asc");
    else { setOrdenCol(col); setOrdenDir("asc"); }
    setPagina(1);
  }

  function IconOrden({ col }) {
    if (ordenCol !== col) return <ChevronsUpDown size={13} className="text-slate-300" />;
    return ordenDir === "asc"
      ? <ChevronUp size={13} className="text-emerald-500" />
      : <ChevronDown size={13} className="text-emerald-500" />;
  }

  return (
    <div className="h-full flex bg-slate-50 overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* ── Columna principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">Mis Pacientes</h1>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                {filtrados.length}
              </span>
            </div>
            <button onClick={() => setModalAgregar(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors">
              <Plus size={14} /> Agregar paciente
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                placeholder="Buscar por nombre, email, teléfono o DNI..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
            </div>
            <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {[
                { val: "todos", label: "Todos" },
                { val: "activos", label: "Con próximo turno" },
                { val: "ausencias", label: "Con ausencias" },
              ].map(f => (
                <button key={f.val} onClick={() => { setFiltro(f.val); setPagina(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${filtro === f.val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    { col: "nombre", label: "Paciente" },
                    { col: "email", label: "Email" },
                    { col: "telefono", label: "Teléfono" },
                    { col: "totalTurnos", label: "Turnos" },
                    { col: "ultimoTurno", label: "Último turno" },
                    { col: "ausencias", label: "Ausencias" },
                  ].map(({ col, label }) => (
                    <th key={col} onClick={() => ordenar(col)}
                      className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none">
                      <div className="flex items-center gap-1.5">
                        {label} <IconOrden col={col} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <User size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No se encontraron pacientes</p>
                    </td>
                  </tr>
                ) : paginados.map((p, idx) => {
                  const colorIdx = pacientesMock.findIndex(pm => pm.id === p.id);
                  return (
                    <tr key={p.id} onClick={() => setPanelPaciente(p)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${panelPaciente?.id === p.id ? "bg-emerald-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${COLORES[colorIdx % COLORES.length]}`}>
                            {initials(p.nombre)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{p.nombre}</p>
                            {p.obraSocial && <p className="text-xs text-slate-400">{p.obraSocial}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.telefono}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700">{p.totalTurnos}</span>
                        <span className="text-xs text-slate-400 ml-1">· {tasaAsistencia(p.totalTurnos, p.ausencias)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatFecha(p.ultimoTurno)}</td>
                      <td className="px-4 py-3">
                        {p.ausencias === 0
                          ? <span className="text-xs text-emerald-600 font-semibold">Ninguna</span>
                          : <span className="text-xs font-semibold text-red-500">{p.ausencias}</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPanelPaciente(p)}
                          className="text-xs font-semibold text-emerald-600 hover:underline">
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPagina(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${pagina === n ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel lateral detalle paciente ── */}
      {panelPaciente && (
        <>
          <div className="fixed inset-0 z-30 lg:hidden bg-black/20" onClick={() => setPanelPaciente(null)} />
          <div className="w-80 shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-hidden"
            style={{ animation: "slide-in .18s ease-out" }}>
            <style>{`@keyframes slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Detalle del paciente</h2>
              <button onClick={() => setPanelPaciente(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Avatar + nombre */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${COLORES[pacientesMock.findIndex(p => p.id === panelPaciente.id) % COLORES.length]}`}>
                    {initials(panelPaciente.nombre)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{panelPaciente.nombre}</p>
                    {panelPaciente.obraSocial
                      ? <p className="text-xs text-slate-400 flex items-center gap-1"><Shield size={10} />{panelPaciente.obraSocial}</p>
                      : <p className="text-xs text-slate-400">Sin obra social</p>
                    }
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail size={12} className="text-slate-400 shrink-0" />{panelPaciente.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone size={12} className="text-slate-400 shrink-0" />{panelPaciente.telefono}
                  </div>
                  {panelPaciente.dni && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User size={12} className="text-slate-400 shrink-0" />DNI {panelPaciente.dni}
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Estadísticas</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Total turnos", val: panelPaciente.totalTurnos, icon: Calendar },
                    { label: "Asistencia", val: tasaAsistencia(panelPaciente.totalTurnos, panelPaciente.ausencias), icon: TrendingUp },
                    { label: "Último turno", val: formatFecha(panelPaciente.ultimoTurno), icon: Clock },
                    { label: "Próximo turno", val: formatFecha(panelPaciente.proximoTurno), icon: CalendarPlus },
                  ].map(({ label, val, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <Icon size={12} className="text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-800">{val}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial */}
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Historial de turnos</p>
                <div className="space-y-2">
                  {panelPaciente.historial.map((h, i) => {
                    const cfg = ESTADO_CFG[h.estado] || ESTADO_CFG.CANCELADO;
                    return (
                      <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 truncate">{h.motivo || "Sin motivo"}</p>
                            <span className={`text-xs font-semibold shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-slate-400">{formatFecha(h.fecha)} · {h.hora} hs</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-5 py-4 border-t border-slate-100 space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">
                <CalendarPlus size={13} /> Nuevo turno para este paciente
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors">
                <MessageSquare size={13} /> Enviar mensaje
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Agregar paciente ── */}
      {modalAgregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalAgregar(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: "modal-in .18s ease-out" }}>
            <style>{`@keyframes modal-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Agregar paciente</h2>
              <button onClick={() => setModalAgregar(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nombre", ph: "Ej: Lucas", req: true },
                  { label: "Apellido", ph: "Ej: Ramírez", req: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                      {f.label} {f.req && <span className="text-emerald-500">*</span>}
                    </label>
                    <input type="text" placeholder={f.ph}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                  </div>
                ))}
              </div>
              {[
                { label: "Email", type: "email", ph: "paciente@email.com", req: true },
                { label: "Teléfono", type: "tel", ph: "+54 9 11 12345678", req: true },
                { label: "DNI", type: "number", ph: "12345678", req: false },
                { label: "Obra social", type: "text", ph: "Ej: OSDE", req: false },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    {f.label} {f.req ? <span className="text-emerald-500">*</span> : <span className="text-slate-400 font-normal">— opcional</span>}
                  </label>
                  <input type={f.type} placeholder={f.ph}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
              ))}
            </div>

            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setModalAgregar(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => setModalAgregar(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors">
                Guardar paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}