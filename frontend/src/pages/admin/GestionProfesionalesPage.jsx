import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, X, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Mail, Calendar, Shield,
  Activity, DollarSign, ToggleLeft, ToggleRight, Edit2,
  LogIn, Trash2, AlertTriangle, User,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const profesionalesMock = [
  { id: 1, nombre: "Camila Torres", email: "camila@turnosalud.com", especialidad: "Psicología", slug: "camila-torres", plan: "Pro", estado: "Activo", turnosMes: 43, registro: "2026-02-25", vencimientoPlan: "2026-03-25", turnosTotales: 187, ausencias: 12, pagos: "$18.600", confirmacionAuto: true, pagoObligatorio: false, obrasSociales: true },
  { id: 2, nombre: "Federico Ruiz", email: "federico@clinic.ar", especialidad: "Odontología", slug: "federico-ruiz", plan: "Básico", estado: "Activo", turnosMes: 18, registro: "2026-02-22", vencimientoPlan: "2026-03-22", turnosTotales: 45, ausencias: 3, pagos: "$0", confirmacionAuto: false, pagoObligatorio: false, obrasSociales: false },
  { id: 3, nombre: "Luciana Páez", email: "luciana.paez@salud.com", especialidad: "Pediatría", slug: "luciana-paez", plan: "Pro", estado: "Activo", turnosMes: 67, registro: "2026-02-20", vencimientoPlan: "2026-04-20", turnosTotales: 312, ausencias: 28, pagos: "$41.000", confirmacionAuto: true, pagoObligatorio: true, obrasSociales: true },
  { id: 4, nombre: "Andrés Molina", email: "andres.m@gmail.com", especialidad: "Cardiología", slug: "andres-molina", plan: "Básico", estado: "Inactivo", turnosMes: 0, registro: "2026-02-18", vencimientoPlan: "2026-02-18", turnosTotales: 22, ausencias: 5, pagos: "$0", confirmacionAuto: false, pagoObligatorio: false, obrasSociales: false },
  { id: 5, nombre: "Natalia Vega", email: "natalia.v@medic.ar", especialidad: "Nutrición", slug: "natalia-vega", plan: "Pro", estado: "Activo", turnosMes: 31, registro: "2026-02-15", vencimientoPlan: "2026-05-15", turnosTotales: 98, ausencias: 4, pagos: "$12.400", confirmacionAuto: true, pagoObligatorio: false, obrasSociales: true },
  { id: 6, nombre: "Martín García", email: "martin@turnosalud.com", especialidad: "Clínica Médica", slug: "martin-garcia", plan: "Pro", estado: "Activo", turnosMes: 55, registro: "2025-12-01", vencimientoPlan: "2026-06-01", turnosTotales: 234, ausencias: 18, pagos: "$27.500", confirmacionAuto: true, pagoObligatorio: false, obrasSociales: true },
  { id: 7, nombre: "Sofía Ramos", email: "sofia.ramos@psico.com", especialidad: "Psiquiatría", slug: "sofia-ramos", plan: "Básico", estado: "Activo", turnosMes: 24, registro: "2026-01-10", vencimientoPlan: "2026-04-10", turnosTotales: 67, ausencias: 2, pagos: "$0", confirmacionAuto: false, pagoObligatorio: true, obrasSociales: false },
];

const POR_PAGINA = 5;

function initials(n) { return n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase(); }
function formatFecha(f) {
  if (!f) return "—";
  return new Date(f + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

export default function GestionProfesionalesPage() {
  const navigate = useNavigate();

  const [profesionales, setProfesionales] = useState(profesionalesMock);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [ordenCol, setOrdenCol] = useState("nombre");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [panelProf, setPanelProf] = useState(null);
  const [modalForm, setModalForm] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [tabForm, setTabForm] = useState("datos");
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", especialidad: "", slug: "", plan: "Básico", password: "" });

  const filtrados = useMemo(() => {
    let lista = [...profesionales];
    if (busqueda) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.especialidad.toLowerCase().includes(q)
      );
    }
    if (filtro === "activos") lista = lista.filter(p => p.estado === "Activo");
    if (filtro === "inactivos") lista = lista.filter(p => p.estado === "Inactivo");
    if (filtro === "pro") lista = lista.filter(p => p.plan === "Pro");
    if (filtro === "basico") lista = lista.filter(p => p.plan === "Básico");

    lista.sort((a, b) => {
      let va = a[ordenCol] ?? "", vb = b[ordenCol] ?? "";
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return ordenDir === "asc" ? -1 : 1;
      if (va > vb) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });
    return lista;
  }, [profesionales, busqueda, filtro, ordenCol, ordenDir]);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function ordenar(col) {
    if (ordenCol === col) setOrdenDir(d => d === "asc" ? "desc" : "asc");
    else { setOrdenCol(col); setOrdenDir("asc"); }
    setPagina(1);
  }

  function toggleEstado(id) {
    setProfesionales(ps => ps.map(p =>
      p.id === id ? { ...p, estado: p.estado === "Activo" ? "Inactivo" : "Activo" } : p
    ));
    if (panelProf?.id === id) setPanelProf(p => ({ ...p, estado: p.estado === "Activo" ? "Inactivo" : "Activo" }));
  }

  function eliminar(id) {
    setProfesionales(ps => ps.filter(p => p.id !== id));
    setModalEliminar(null);
    if (panelProf?.id === id) setPanelProf(null);
  }

  function abrirEditar(prof) {
    const [nombre, ...apellidoArr] = prof.nombre.split(" ");
    setForm({ nombre, apellido: apellidoArr.join(" "), email: prof.email, especialidad: prof.especialidad, slug: prof.slug, plan: prof.plan, password: "" });
    setTabForm("datos");
    setModalForm(prof);
  }

  function abrirNuevo() {
    setForm({ nombre: "", apellido: "", email: "", especialidad: "", slug: "", plan: "Básico", password: "" });
    setTabForm("datos");
    setModalForm("nuevo");
  }

  function IconOrden({ col }) {
    if (ordenCol !== col) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return ordenDir === "asc"
      ? <ChevronUp size={12} className="text-violet-500" />
      : <ChevronDown size={12} className="text-violet-500" />;
  }

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Columna principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900">Profesionales</h1>
              <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
                {filtrados.length}
              </span>
            </div>
            <button onClick={abrirNuevo}
              className="flex items-center gap-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors">
              <Plus size={14} /> Crear profesional
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                placeholder="Buscar por nombre, email o especialidad..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
            </div>
            <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5 flex-wrap">
              {[
                { val: "todos", label: "Todos" },
                { val: "activos", label: "Activos" },
                { val: "inactivos", label: "Inactivos" },
                { val: "pro", label: "Plan Pro" },
                { val: "basico", label: "Plan Básico" },
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
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    { col: "nombre", label: "Profesional" },
                    { col: "email", label: "Email" },
                    { col: "especialidad", label: "Especialidad" },
                    { col: "plan", label: "Plan" },
                    { col: "estado", label: "Estado" },
                    { col: "turnosMes", label: "Turnos mes" },
                    { col: "registro", label: "Registro" },
                  ].map(({ col, label }) => (
                    <th key={col} onClick={() => ordenar(col)}
                      className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none">
                      <div className="flex items-center gap-1.5">{label}<IconOrden col={col} /></div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <User size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No se encontraron profesionales</p>
                    </td>
                  </tr>
                ) : paginados.map(p => (
                  <tr key={p.id} onClick={() => setPanelProf(p)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${panelProf?.id === p.id ? "bg-violet-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs shrink-0">
                          {initials(p.nombre)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{p.nombre}</p>
                          <p className="text-xs text-slate-400">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.especialidad}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.plan === "Pro" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${p.estado === "Activo" ? "text-emerald-600" : "text-red-400"}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">{p.turnosMes}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatFecha(p.registro)}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleEstado(p.id)} title={p.estado === "Activo" ? "Desactivar" : "Activar"}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                          {p.estado === "Activo" ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => abrirEditar(p)} title="Editar"
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => alert(`Impersonando a ${p.nombre}...`)} title="Impersonar"
                          className="w-7 h-7 rounded-lg hover:bg-violet-50 flex items-center justify-center text-violet-400 transition-colors">
                          <LogIn size={13} />
                        </button>
                        <button onClick={() => setModalEliminar(p)} title="Eliminar"
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPagina(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${pagina === n ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel lateral detalle ── */}
      {panelProf && (
        <div className="w-80 shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-hidden"
          style={{ animation: "slide-in .18s ease-out" }}>
          <style>{`@keyframes slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Detalle</h2>
            <button onClick={() => setPanelProf(null)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                  {initials(panelProf.nombre)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{panelProf.nombre}</p>
                  <p className="text-xs text-slate-400">{panelProf.especialidad}</p>
                  <span className={`text-xs font-semibold ${panelProf.estado === "Activo" ? "text-emerald-600" : "text-red-400"}`}>
                    ● {panelProf.estado}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail size={12} className="text-slate-400 shrink-0" />{panelProf.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-slate-400">Slug:</span>
                  <span className="font-mono">/{panelProf.slug}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Plan</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${panelProf.plan === "Pro" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                  {panelProf.plan}
                </span>
                <span className="text-xs text-slate-400">Vence {formatFecha(panelProf.vencimientoPlan)}</span>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Métricas</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Turnos totales", val: panelProf.turnosTotales, icon: Calendar },
                  { label: "Ausencias", val: panelProf.ausencias, icon: Activity },
                  { label: "Este mes", val: panelProf.turnosMes, icon: Calendar },
                  { label: "Pagos procesados", val: panelProf.pagos, icon: DollarSign },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <Icon size={12} className="text-slate-400 mb-1" />
                    <p className="text-xs font-bold text-slate-800">{val}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Configuración activa</p>
              <div className="space-y-2">
                {[
                  { label: "Confirmación automática", val: panelProf.confirmacionAuto },
                  { label: "Pago obligatorio", val: panelProf.pagoObligatorio },
                  { label: "Obras sociales", val: panelProf.obrasSociales },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{label}</span>
                    <span className={`font-semibold ${val ? "text-emerald-600" : "text-slate-400"}`}>
                      {val ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 space-y-2">
            <button onClick={() => abrirEditar(panelProf)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors">
              <Edit2 size={13} /> Editar datos
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => toggleEstado(panelProf.id)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors">
                {panelProf.estado === "Activo" ? <ToggleLeft size={13} /> : <ToggleRight size={13} className="text-emerald-500" />}
                {panelProf.estado === "Activo" ? "Suspender" : "Activar"}
              </button>
              <button onClick={() => setModalEliminar(panelProf)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold transition-colors">
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Crear/Editar ── */}
      {modalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalForm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            style={{ animation: "modal-in .18s ease-out" }}>
            <style>{`@keyframes modal-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                {modalForm === "nuevo" ? "Nuevo profesional" : `Editar · ${panelProf?.nombre || ""}`}
              </h2>
              <button onClick={() => setModalForm(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="flex border-b border-slate-100">
              {[
                { val: "datos", label: "Datos personales" },
                { val: "plan", label: "Plan" },
                { val: "acceso", label: "Acceso" },
              ].map(t => (
                <button key={t.val} onClick={() => setTabForm(t.val)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2
                    ${tabForm === t.val ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5 space-y-4">
              {tabForm === "datos" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre <span className="text-violet-500">*</span></label>
                      <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        placeholder="Ej: Camila" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Apellido <span className="text-violet-500">*</span></label>
                      <input type="text" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                        placeholder="Ej: Torres" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email <span className="text-violet-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="profesional@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Especialidad <span className="text-violet-500">*</span></label>
                    <input type="text" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}
                      placeholder="Ej: Psicología" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Slug (URL pública) <span className="text-violet-500">*</span></label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 shrink-0">turnosalud.com/</span>
                      <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
                        placeholder="camila-torres" className={inputCls} />
                    </div>
                  </div>
                </>
              )}

              {tabForm === "plan" && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-3">Seleccioná el plan</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Básico", "Pro"].map(plan => (
                      <button key={plan} onClick={() => setForm(f => ({ ...f, plan }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all
                          ${form.plan === plan ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <p className={`text-sm font-bold mb-1 ${form.plan === plan ? "text-violet-700" : "text-slate-700"}`}>{plan}</p>
                        <p className="text-xs text-slate-400">
                          {plan === "Básico" ? "Funcionalidades esenciales, sin integraciones" : "Todo incluido + WhatsApp + pagos"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tabForm === "acceso" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Contraseña temporal <span className="text-slate-400 font-normal">— opcional</span>
                  </label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mín. 8 caracteres" className={inputCls} />
                  <p className="text-xs text-slate-400 mt-1.5">El profesional deberá cambiarla en su primer inicio de sesión.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-6 pb-5">
              <button onClick={() => setModalForm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => setModalForm(null)}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
                {modalForm === "nuevo" ? "Crear profesional" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ── */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalEliminar(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            style={{ animation: "modal-in .18s ease-out" }}>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">¿Eliminar profesional?</h2>
            <p className="text-sm text-slate-500 mb-5">
              Vas a eliminar la cuenta de <span className="font-semibold text-slate-700">{modalEliminar.nombre}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModalEliminar(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => eliminar(modalEliminar.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}