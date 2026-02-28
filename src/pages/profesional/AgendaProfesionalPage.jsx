import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Plus, Settings, Lock,
  CheckCircle2, UserX, XCircle, RefreshCw, X,
  Calendar, Clock, MapPin, Video, Mail, Phone, FileText,
  ToggleLeft, ToggleRight,
} from "lucide-react";

// ── Paleta: slate oscuro + emerald ────────────────────────────────────────────

// ── Mock data ─────────────────────────────────────────────────────────────────
const HORAS = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}); // 08:00 → 17:30

const HOY = new Date();

function fechaBase() {
  const d = new Date(HOY);
  d.setDate(d.getDate() - d.getDay() + 1); // Lunes de la semana actual
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDia(date) {
  return date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
}

function formatMes(date) {
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

// Turnos mock indexados por fecha y hora
const turnosMock = {
  [toKey(addDays(fechaBase(), 0))]: {
    "09:00": { id: 1, paciente: "Lucas Ramírez", email: "lucas@email.com", telefono: "+54 9 11 1234", motivo: "Control anual", modalidad: "Presencial", estado: "CONFIRMADO", historial: ["Creado", "Confirmado"] },
    "10:00": { id: 2, paciente: "Ana Gómez", email: "ana@email.com", telefono: "+54 9 11 5678", motivo: null, modalidad: "Virtual", estado: "PENDIENTE", historial: ["Creado"] },
    "14:00": { id: 3, paciente: "Carlos Méndez", email: "carlos@email.com", telefono: "+54 9 11 9999", motivo: "Resultados", modalidad: "Presencial", estado: "CONFIRMADO", historial: ["Creado", "Confirmado"] },
  },
  [toKey(addDays(fechaBase(), 1))]: {
    "09:30": { id: 4, paciente: "María Rodríguez", email: "maria@email.com", telefono: "+54 9 11 4444", motivo: null, modalidad: "Presencial", estado: "PENDIENTE", historial: ["Creado"] },
    "11:00": { id: 5, paciente: "Jorge Suárez", email: "jorge@email.com", telefono: "+54 9 11 7777", motivo: "Primera consulta", modalidad: "Virtual", estado: "CANCELADO", historial: ["Creado", "Cancelado"] },
    "15:00": { id: 6, paciente: "Paula Fernández", email: "paula@email.com", telefono: "+54 9 11 2222", motivo: null, modalidad: "Presencial", estado: "CONFIRMADO", historial: ["Creado", "Confirmado"] },
  },
  [toKey(addDays(fechaBase(), 2))]: {
    "10:00": { id: 7, paciente: "Roberto Silva", email: "rob@email.com", telefono: "+54 9 11 3333", motivo: "Seguimiento", modalidad: "Presencial", estado: "CONFIRMADO", historial: ["Creado", "Confirmado"] },
  },
  [toKey(addDays(fechaBase(), 3))]: {
    "09:00": { id: 8, paciente: "Valentina López", email: "vale@email.com", telefono: "+54 9 11 8888", motivo: null, modalidad: "Virtual", estado: "PENDIENTE", historial: ["Creado"] },
    "14:30": { id: 9, paciente: "Diego Torres", email: "diego@email.com", telefono: "+54 9 11 6666", motivo: "Control", modalidad: "Presencial", estado: "CONFIRMADO", historial: ["Creado", "Confirmado"] },
  },
};

// Horarios bloqueados
const bloqueadosMock = {
  [toKey(addDays(fechaBase(), 4))]: ["09:00", "09:30", "10:00"],
  [toKey(addDays(fechaBase(), 1))]: ["14:00", "14:30"],
};

// Config horarios profesional
const configInicial = {
  dias: {
    Lunes: { activo: true, inicio: "09:00", fin: "17:00" },
    Martes: { activo: true, inicio: "09:00", fin: "17:00" },
    Miércoles: { activo: true, inicio: "09:00", fin: "17:00" },
    Jueves: { activo: true, inicio: "09:00", fin: "17:00" },
    Viernes: { activo: true, inicio: "09:00", fin: "13:00" },
    Sábado: { activo: false, inicio: "09:00", fin: "13:00" },
    Domingo: { activo: false, inicio: "09:00", fin: "13:00" },
  },
  duracion: 30,
};

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_CFG = {
  CONFIRMADO: { cls: "bg-emerald-100 border-emerald-200 text-emerald-800", dot: "bg-emerald-500", label: "Confirmado" },
  PENDIENTE:  { cls: "bg-amber-100 border-amber-200 text-amber-800",   dot: "bg-amber-500",   label: "Pendiente" },
  CANCELADO:  { cls: "bg-red-100 border-red-200 text-red-700",         dot: "bg-red-400",     label: "Cancelado" },
};

function initials(n) {
  return n.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
}

function Modal({ onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
        style={{ animation: "modal-in .18s ease-out" }}
      >
        <style>{`@keyframes modal-in{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        {children}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AgendaProfesionalPage() {
  const navigate = useNavigate();

  const [semanaBase, setSemanaBase] = useState(fechaBase());
  const [vista, setVista] = useState("semana"); // "dia" | "semana" | "mes"
  const [diaActivo, setDiaActivo] = useState(toKey(HOY));

  const [turnos, setTurnos] = useState(turnosMock);
  const [bloqueados, setBloqueados] = useState(bloqueadosMock);

  const [modalDetalle, setModalDetalle] = useState(null); // { fecha, hora, turno }
  const [modalBloquear, setModalBloquear] = useState(null); // { fecha, hora }
  const [modalNuevoTurno, setModalNuevoTurno] = useState(null); // { fecha, hora }
  const [panelConfig, setPanelConfig] = useState(false);
  const [config, setConfig] = useState(configInicial);

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

  // ── Navegación ──
  function prevSemana() { setSemanaBase(d => addDays(d, -7)); }
  function nextSemana() { setSemanaBase(d => addDays(d, 7)); }

  // ── Estado turno ──
  function cambiarEstado(fecha, hora, nuevoEstado) {
    setTurnos(t => ({
      ...t,
      [fecha]: {
        ...t[fecha],
        [hora]: {
          ...t[fecha][hora],
          estado: nuevoEstado,
          historial: [...(t[fecha]?.[hora]?.historial || []), nuevoEstado],
        },
      },
    }));
    setModalDetalle(null);
  }

  // ── Bloquear horario ──
  function bloquearHorario(fecha, hora) {
    setBloqueados(b => ({
      ...b,
      [fecha]: [...(b[fecha] || []), hora],
    }));
    setModalBloquear(null);
  }

  // ── Celda de la grilla ──
  function Celda({ fecha, hora }) {
    const turno = turnos[fecha]?.[hora];
    const bloqueado = bloqueados[fecha]?.includes(hora);
    const esHoy = fecha === toKey(HOY);

    if (turno) {
      const cfg = ESTADO_CFG[turno.estado];
      return (
        <div
          onClick={() => setModalDetalle({ fecha, hora, turno })}
          className={`h-full rounded-lg border cursor-pointer px-2 py-1 transition-all hover:opacity-90 active:scale-95 ${cfg.cls}`}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            <span className="text-xs font-bold truncate leading-tight">{turno.paciente.split(" ")[0]}</span>
          </div>
          <p className="text-xs opacity-70 truncate leading-tight">{turno.modalidad}</p>
        </div>
      );
    }

    if (bloqueado) {
      return (
        <div className="h-full rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Lock size={11} className="text-slate-400" />
        </div>
      );
    }

    return (
      <div
        onClick={() => setModalBloquear({ fecha, hora })}
        className="h-full rounded-lg hover:bg-emerald-50 hover:border hover:border-emerald-200 transition-all cursor-pointer group"
      >
        <Plus size={12} className="text-emerald-400 opacity-0 group-hover:opacity-100 m-auto mt-2" />
      </div>
    );
  }

  // ── Etiqueta de semana ──
  const inicioSemana = diasSemana[0];
  const finSemana = diasSemana[6];
  const labelSemana = `${inicioSemana.getDate()} - ${finSemana.getDate()} ${formatMes(finSemana)}`;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* ── Header agenda ── */}
      <div className="shrink-0 h-14 bg-white border-b border-slate-100 flex items-center gap-3 px-4">
        {/* Nav fecha */}
        <div className="flex items-center gap-1">
          <button onClick={prevSemana} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-slate-800 capitalize min-w-44 text-center">
            {vista === "semana" ? labelSemana : formatMes(HOY)}
          </span>
          <button onClick={nextSemana} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Selector vista */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {["dia", "semana", "mes"].map(v => (
            <button key={v} onClick={() => setVista(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all
                ${vista === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Acciones */}
        <button onClick={() => setModalBloquear({ fecha: toKey(HOY), hora: "09:00" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors">
          <Lock size={13} /> Bloquear horario
        </button>
        <button onClick={() => setModalNuevoTurno({ fecha: toKey(HOY), hora: "09:00" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
          <Plus size={13} /> Turno manual
        </button>
        <button onClick={() => setPanelConfig(true)}
          className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 transition-colors">
          <Settings size={15} />
        </button>
      </div>

      {/* ── Grilla semana ── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px] h-full flex flex-col">

          {/* Cabecera días */}
          <div className="shrink-0 grid bg-white border-b border-slate-100 sticky top-0 z-10"
            style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div className="border-r border-slate-100" />
            {diasSemana.map(d => {
              const key = toKey(d);
              const esHoy = key === toKey(HOY);
              return (
                <div key={key} className={`py-2.5 text-center border-r border-slate-100 ${esHoy ? "bg-emerald-50" : ""}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${esHoy ? "text-emerald-600" : "text-slate-400"}`}>
                    {DIAS_SEMANA[d.getDay() === 0 ? 6 : d.getDay() - 1].slice(0, 3)}
                  </p>
                  <p className={`text-lg font-bold leading-tight ${esHoy ? "text-emerald-600" : "text-slate-700"}`}>
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Filas horas */}
          <div className="flex-1">
            {HORAS.map((hora, hi) => (
              <div key={hora} className="grid border-b border-slate-100" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", height: 52 }}>
                {/* Etiqueta hora */}
                <div className="flex items-start justify-end pr-2 pt-1 border-r border-slate-100 shrink-0">
                  {hora.endsWith(":00") && (
                    <span className="text-xs text-slate-400 font-medium">{hora}</span>
                  )}
                </div>
                {/* Celdas */}
                {diasSemana.map(d => {
                  const key = toKey(d);
                  const esHoy = key === toKey(HOY);
                  return (
                    <div key={key} className={`border-r border-slate-100 p-0.5 ${esHoy ? "bg-emerald-50/40" : ""}`}>
                      <Celda fecha={key} hora={hora} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-2 flex items-center gap-5">
        {[
          { dot: "bg-emerald-500", label: "Confirmado" },
          { dot: "bg-amber-500",   label: "Pendiente" },
          { dot: "bg-red-400",     label: "Cancelado" },
          { dot: "bg-slate-300",   label: "Bloqueado" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-xs text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Panel Config deslizable ── */}
      {panelConfig && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setPanelConfig(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
            style={{ animation: "slide-in .2s ease-out" }}>
            <style>{`@keyframes slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Configurar horarios</h2>
              <button onClick={() => setPanelConfig(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Duración */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Duración del turno</p>
                <div className="flex gap-2 flex-wrap">
                  {[15, 20, 30, 45, 60].map(d => (
                    <button key={d} onClick={() => setConfig(c => ({ ...c, duracion: d }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                        ${config.duracion === d ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Días y horarios */}
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Días de atención</p>
                <div className="space-y-3">
                  {DIAS_SEMANA.map(dia => {
                    const d = config.dias[dia];
                    return (
                      <div key={dia} className={`rounded-xl border p-3 transition-all ${d.activo ? "border-slate-200" : "border-slate-100 opacity-50"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">{dia}</span>
                          <button onClick={() => setConfig(c => ({
                            ...c, dias: { ...c.dias, [dia]: { ...c.dias[dia], activo: !c.dias[dia].activo } }
                          }))}>
                            {d.activo
                              ? <ToggleRight size={22} className="text-emerald-500" />
                              : <ToggleLeft size={22} className="text-slate-300" />
                            }
                          </button>
                        </div>
                        {d.activo && (
                          <div className="flex items-center gap-2">
                            <input type="time" value={d.inicio}
                              onChange={e => setConfig(c => ({ ...c, dias: { ...c.dias, [dia]: { ...c.dias[dia], inicio: e.target.value } } }))}
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400" />
                            <span className="text-xs text-slate-400">—</span>
                            <input type="time" value={d.fin}
                              onChange={e => setConfig(c => ({ ...c, dias: { ...c.dias, [dia]: { ...c.dias[dia], fin: e.target.value } } }))}
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100">
              <button onClick={() => setPanelConfig(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors">
                Guardar configuración
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Detalle turno ── */}
      {modalDetalle && (
        <Modal onClose={() => setModalDetalle(null)}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                {initials(modalDetalle.turno.paciente)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{modalDetalle.turno.paciente}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_CFG[modalDetalle.turno.estado].cls}`}>
                  {ESTADO_CFG[modalDetalle.turno.estado].label}
                </span>
              </div>
            </div>
            <button onClick={() => setModalDetalle(null)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-4 space-y-3">
            {[
              { icon: Calendar, label: "Fecha", val: new Date(modalDetalle.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) },
              { icon: Clock,    label: "Hora",  val: `${modalDetalle.hora} hs · ${config.duracion} min` },
              { icon: modalDetalle.turno.modalidad === "Virtual" ? Video : MapPin, label: "Modalidad", val: modalDetalle.turno.modalidad },
              { icon: Mail,     label: "Email", val: modalDetalle.turno.email },
              { icon: Phone,    label: "Tel.",  val: modalDetalle.turno.telefono },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm text-slate-800 font-medium capitalize">{val}</p>
                </div>
              </div>
            ))}

            {modalDetalle.turno.motivo && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText size={13} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Motivo</p>
                  <p className="text-sm text-slate-800">{modalDetalle.turno.motivo}</p>
                </div>
              </div>
            )}

            {/* Historial */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Historial</p>
              <div className="flex gap-2 flex-wrap">
                {modalDetalle.turno.historial.map((h, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{h}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-6 pb-5 grid grid-cols-2 gap-2">
            {modalDetalle.turno.estado === "PENDIENTE" && (
              <button onClick={() => cambiarEstado(modalDetalle.fecha, modalDetalle.hora, "CONFIRMADO")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
                <CheckCircle2 size={14} /> Confirmar
              </button>
            )}
            {modalDetalle.turno.estado === "CONFIRMADO" && (
              <button onClick={() => cambiarEstado(modalDetalle.fecha, modalDetalle.hora, "CANCELADO")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                <UserX size={14} /> Marcar ausente
              </button>
            )}
            <button onClick={() => cambiarEstado(modalDetalle.fecha, modalDetalle.hora, "CANCELADO")}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold transition-colors">
              <XCircle size={14} /> Cancelar
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors">
              <RefreshCw size={14} /> Reprogramar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Bloquear horario ── */}
      {modalBloquear && (
        <Modal onClose={() => setModalBloquear(null)}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Bloquear horario</h2>
            <button onClick={() => setModalBloquear(null)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={16} /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-500">
              Bloqueá este horario para que los pacientes no puedan reservar.
            </p>
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <Lock size={15} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Horario a bloquear</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(modalBloquear.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} · {modalBloquear.hora} hs
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 flex gap-2">
            <button onClick={() => setModalBloquear(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={() => bloquearHorario(modalBloquear.fecha, modalBloquear.hora)}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors">
              Confirmar bloqueo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}