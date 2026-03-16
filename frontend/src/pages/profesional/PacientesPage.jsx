import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Plus, X, ChevronLeft, ChevronRight,
  User, Mail, Phone, Calendar, Clock, Shield, TrendingUp,
  CalendarPlus, MessageSquare, Loader2,
} from "lucide-react";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";

const POR_PAGINA = 10;

function initials(nombre, apellido) {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
}
function formatFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
function tasaAsistencia(turnos) {
  if (!turnos?.length) return "—";
  const ausentes = turnos.filter(t => t.estado === 'AUSENTE').length;
  return `${Math.round(((turnos.length - ausentes) / turnos.length) * 100)}%`;
}

const COLORES = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",  "bg-cyan-100 text-cyan-700",
];

const ESTADO_CFG = {
  CONFIRMADO: { cls: "text-emerald-600", dot: "bg-emerald-500", label: "Asistió" },
  PENDIENTE:  { cls: "text-amber-500",   dot: "bg-amber-400",   label: "Pendiente" },
  AUSENTE:    { cls: "text-red-500",     dot: "bg-red-400",     label: "Ausente" },
  CANCELADO:  { cls: "text-slate-400",   dot: "bg-slate-300",   label: "Cancelado" },
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all";

export default function PacientesPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [pacientes, setPacientes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pagina: 1, totalPaginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [panelPaciente, setPanelPaciente] = useState(null); // paciente básico seleccionado
  const [detalle, setDetalle] = useState(null);             // paciente con turnos
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', dni: '', obraSocial: '' });
  const [guardando, setGuardando] = useState(false);
  const timer = useRef(null);

  // Modal Nuevo Turno
  const [modalNuevoTurno, setModalNuevoTurno] = useState(false);
  const [formNuevoTurno, setFormNuevoTurno] = useState({ fecha: '', horaInicio: '', modalidad: 'presencial', notas: '' });
  const [guardandoTurno, setGuardandoTurno] = useState(false);
  const [errorTurno, setErrorTurno] = useState(null);

  // Modal Enviar Mensaje
  const [modalMensaje, setModalMensaje] = useState(false);
  const [formMensaje, setFormMensaje] = useState({ asunto: '', texto: '' });
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [exitoMensaje, setExitoMensaje] = useState(false);

  const cargarPacientes = useCallback(async (p, b) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ pagina: p, porPagina: POR_PAGINA, busqueda: b });
      const { data } = await axios.get(`http://localhost:3001/api/profesional/pacientes?${params}`, { headers });
      setPacientes(data.data || []);
      setPagination(data.pagination || { total: 0, pagina: p, totalPaginas: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => { cargarPacientes(pagina, busqueda); }, [pagina]);

  function handleBusqueda(valor) {
    setBusqueda(valor);
    setPagina(1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => cargarPacientes(1, valor), 400);
  }

  useEffect(() => {
    if (!panelPaciente) { setDetalle(null); return; }
    setCargandoDetalle(true);
    axios.get(`http://localhost:3001/api/profesional/pacientes/${panelPaciente.id}`, { headers })
      .then(({ data }) => setDetalle(data.data))
      .catch(console.error)
      .finally(() => setCargandoDetalle(false));
  }, [panelPaciente?.id]);

  async function guardarPaciente() {
    if (!form.nombre || !form.apellido || !form.email || !form.telefono) return;
    setGuardando(true);
    try {
      await axios.post('http://localhost:3001/api/profesional/pacientes', form, { headers });
      setModalAgregar(false);
      setForm({ nombre: '', apellido: '', email: '', telefono: '', dni: '', obraSocial: '' });
      cargarPacientes(1, busqueda);
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  async function crearNuevoTurno() {
    if (!formNuevoTurno.fecha || !formNuevoTurno.horaInicio) return;
    setGuardandoTurno(true);
    setErrorTurno(null);
    try {
      const payload = {
        fecha: formNuevoTurno.fecha,
        horaInicio: formNuevoTurno.horaInicio,
        modalidad: formNuevoTurno.modalidad,
        notas: formNuevoTurno.notas,
        paciente: {
          nombre: panelPaciente.nombre,
          apellido: panelPaciente.apellido,
          email: panelPaciente.email,
          telefono: panelPaciente.telefono || '—',
        },
      };
      await axios.post('http://localhost:3001/api/profesional/turnos', payload, { headers });
      setModalNuevoTurno(false);
      setFormNuevoTurno({ fecha: '', horaInicio: '', modalidad: 'presencial', notas: '' });
      // Refrescar detalle del paciente para mostrar el nuevo turno
      const { data } = await axios.get(`http://localhost:3001/api/profesional/pacientes/${panelPaciente.id}`, { headers });
      setDetalle(data.data);
    } catch (e) {
      setErrorTurno(e.response?.data?.message || 'Error al crear el turno. Verificá los datos.');
    } finally {
      setGuardandoTurno(false);
    }
  }

  async function enviarMensaje() {
    if (!formMensaje.asunto.trim() || !formMensaje.texto.trim()) return;
    setEnviandoMensaje(true);
    try {
      await axios.post(
        `http://localhost:3001/api/profesional/pacientes/${panelPaciente.id}/mensaje`,
        { asunto: formMensaje.asunto, mensaje: formMensaje.texto },
        { headers }
      );
      setExitoMensaje(true);
      setTimeout(() => {
        setModalMensaje(false);
        setFormMensaje({ asunto: '', texto: '' });
        setExitoMensaje(false);
      }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setEnviandoMensaje(false);
    }
  }

  // Estadísticas del panel (calculadas desde los turnos del detalle)
  const turnos = detalle?.turnos || [];
  const ausencias = turnos.filter(t => t.estado === 'AUSENTE').length;
  const ultimoTurno = turnos.find(t => t.estado === 'CONFIRMADO')?.fecha;
  const proximoTurno = [...turnos].reverse().find(t => t.estado === 'PENDIENTE')?.fecha;

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
                {pagination.total}
              </span>
            </div>
            <button onClick={() => setModalAgregar(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors">
              <Plus size={14} /> Agregar paciente
            </button>
          </div>

          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={busqueda} onChange={e => handleBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono o DNI..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {cargando ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 size={24} className="animate-spin mr-2" /> Cargando pacientes...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Paciente</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Teléfono</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">DNI</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Alta</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pacientes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <User size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No se encontraron pacientes</p>
                      </td>
                    </tr>
                  ) : pacientes.map((p, idx) => (
                    <tr key={p.id} onClick={() => setPanelPaciente(p)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${panelPaciente?.id === p.id ? "bg-emerald-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${COLORES[idx % COLORES.length]}`}>
                            {initials(p.nombre, p.apellido)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{p.nombre} {p.apellido}</p>
                            {p.obraSocial && <p className="text-xs text-slate-400">{p.obraSocial}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.telefono}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.dni || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatFecha(p.createdAt)}</td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPanelPaciente(p)}
                          className="text-xs font-semibold text-emerald-600 hover:underline">
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Paginación */}
            {pagination.totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Página {pagina} de {pagination.totalPaginas} · {pagination.total} pacientes
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(pagination.totalPaginas, 5) }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPagina(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${pagina === n ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPagina(p => Math.min(pagination.totalPaginas, p + 1))} disabled={pagina === pagination.totalPaginas}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel lateral detalle ── */}
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

            {cargandoDetalle ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Avatar + nombre */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {initials(panelPaciente.nombre, panelPaciente.apellido)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{panelPaciente.nombre} {panelPaciente.apellido}</p>
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

                {/* Estadísticas (si cargó el detalle) */}
                {detalle && (
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Estadísticas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Total turnos", val: turnos.length, icon: Calendar },
                        { label: "Asistencia",   val: tasaAsistencia(turnos), icon: TrendingUp },
                        { label: "Último turno", val: formatFecha(ultimoTurno), icon: Clock },
                        { label: "Próximo turno", val: formatFecha(proximoTurno), icon: CalendarPlus },
                      ].map(({ label, val, icon: Icon }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3">
                          <Icon size={12} className="text-slate-400 mb-1" />
                          <p className="text-xs font-bold text-slate-800">{val}</p>
                          <p className="text-xs text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial */}
                {detalle && turnos.length > 0 && (
                  <div className="px-5 py-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Historial de turnos</p>
                    <div className="space-y-2">
                      {turnos.map((t) => {
                        const cfg = ESTADO_CFG[t.estado] || ESTADO_CFG.CANCELADO;
                        return (
                          <div key={t.id} className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-700 truncate">{t.notas || "Sin notas"}</p>
                                <span className={`text-xs font-semibold shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                              </div>
                              <p className="text-xs text-slate-400">{formatFecha(t.fecha)} · {t.horaInicio}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="px-5 py-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { setErrorTurno(null); setFormNuevoTurno({ fecha: '', horaInicio: '', modalidad: 'presencial', notas: '' }); setModalNuevoTurno(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors">
                <CalendarPlus size={13} /> Nuevo turno para este paciente
              </button>
              <button
                onClick={() => { setFormMensaje({ asunto: '', texto: '' }); setExitoMensaje(false); setModalMensaje(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors">
                <MessageSquare size={13} /> Enviar mensaje
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Nuevo turno para paciente ── */}
      {modalNuevoTurno && panelPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalNuevoTurno(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: "modal-in .18s ease-out" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Nuevo turno</h2>
                <p className="text-xs text-slate-400 mt-0.5">{panelPaciente.nombre} {panelPaciente.apellido}</p>
              </div>
              <button onClick={() => setModalNuevoTurno(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha <span className="text-emerald-500">*</span></label>
                  <input type="date" value={formNuevoTurno.fecha}
                    onChange={e => setFormNuevoTurno(f => ({...f, fecha: e.target.value}))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hora <span className="text-emerald-500">*</span></label>
                  <input type="time" value={formNuevoTurno.horaInicio}
                    onChange={e => setFormNuevoTurno(f => ({...f, horaInicio: e.target.value}))}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Modalidad</label>
                <select value={formNuevoTurno.modalidad}
                  onChange={e => setFormNuevoTurno(f => ({...f, modalidad: e.target.value}))}
                  className={inputCls}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notas <span className="text-slate-400 font-normal">— opcional</span></label>
                <textarea rows={3} value={formNuevoTurno.notas}
                  onChange={e => setFormNuevoTurno(f => ({...f, notas: e.target.value}))}
                  placeholder="Motivo de consulta, instrucciones, etc."
                  className={inputCls + " resize-none"} />
              </div>
              {errorTurno && (
                <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{errorTurno}</p>
              )}
            </div>

            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setModalNuevoTurno(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={crearNuevoTurno} disabled={guardandoTurno || !formNuevoTurno.fecha || !formNuevoTurno.horaInicio}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {guardandoTurno ? 'Creando...' : 'Crear turno'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Enviar mensaje ── */}
      {modalMensaje && panelPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalMensaje(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: "modal-in .18s ease-out" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Enviar mensaje</h2>
                <p className="text-xs text-slate-400 mt-0.5">Para: {panelPaciente.email}</p>
              </div>
              <button onClick={() => setModalMensaje(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            {exitoMensaje ? (
              <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Mail size={22} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">¡Mensaje enviado!</p>
                <p className="text-xs text-slate-400">{panelPaciente.nombre} recibirá el email en instantes.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Asunto <span className="text-emerald-500">*</span></label>
                    <input type="text" value={formMensaje.asunto}
                      onChange={e => setFormMensaje(f => ({...f, asunto: e.target.value}))}
                      placeholder="Ej: Recordatorio de turno"
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Mensaje <span className="text-emerald-500">*</span></label>
                    <textarea rows={5} value={formMensaje.texto}
                      onChange={e => setFormMensaje(f => ({...f, texto: e.target.value}))}
                      placeholder="Escribí tu mensaje aquí..."
                      className={inputCls + " resize-none"} />
                  </div>
                </div>
                <div className="px-6 pb-5 flex gap-2">
                  <button onClick={() => setModalMensaje(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={enviarMensaje}
                    disabled={enviandoMensaje || !formMensaje.asunto.trim() || !formMensaje.texto.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                    {enviandoMensaje ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre <span className="text-emerald-500">*</span></label>
                  <input type="text" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Lucas" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Apellido <span className="text-emerald-500">*</span></label>
                  <input type="text" value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} placeholder="Ej: Ramírez" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email <span className="text-emerald-500">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="paciente@email.com" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Teléfono <span className="text-emerald-500">*</span></label>
                <input type="tel" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="+54 9 11 12345678" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">DNI <span className="text-slate-400 font-normal">— opcional</span></label>
                  <input type="number" value={form.dni} onChange={e => setForm(f => ({...f, dni: e.target.value}))} placeholder="12345678" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Obra social <span className="text-slate-400 font-normal">— opcional</span></label>
                  <input type="text" value={form.obraSocial} onChange={e => setForm(f => ({...f, obraSocial: e.target.value}))} placeholder="Ej: OSDE" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => setModalAgregar(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={guardarPaciente} disabled={guardando}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar paciente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
