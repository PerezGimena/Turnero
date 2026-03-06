import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from '../../store/useAuthStore';
import {
  ChevronLeft, ChevronRight, Plus, Lock,
  CheckCircle2, UserX, XCircle, RefreshCw, X,
  Calendar, Clock, MapPin, Video, Mail, Phone, FileText,
  Loader2, AlertCircle
} from "lucide-react";

const HORAS = Array.from({ length: 60 }, (_, i) => {
  const h = Math.floor(i / 6) + 8;
  const m = (i % 6) * 10;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

const HOY = new Date();

function fechaBase() {
  const d = new Date(HOY);
  d.setDate(d.getDate() - d.getDay() + 1);
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

function formatMes(date) {
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ESTADO_CFG = {
  confirmado: { cls: "bg-emerald-100 border-emerald-200 text-emerald-800", dot: "bg-emerald-500", label: "Confirmado" },
  pendiente:  { cls: "bg-amber-100 border-amber-200 text-amber-800",       dot: "bg-amber-500",   label: "Pendiente" },
  cancelado:  { cls: "bg-red-100 border-red-200 text-red-700",             dot: "bg-red-400",     label: "Cancelado" },
  ausente:    { cls: "bg-gray-100 border-gray-200 text-gray-600",          dot: "bg-gray-400",    label: "Ausente" },
};

function initials(n) {
  if (!n) return "--";
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

// ── Celda FUERA del componente principal ──────────────────────────────────────
function Celda({ fecha, hora, turnos, bloqueados, onVerDetalle, onBloquear }) {
  const turno = turnos[fecha]?.[hora];
  const bloqueado = bloqueados[fecha]?.includes(hora);

  if (turno) {
    const estadoKey = turno.estado.toLowerCase();
    const cfg = ESTADO_CFG[estadoKey] || ESTADO_CFG.pendiente;
    return (
      <div
        onClick={() => onVerDetalle({ fecha, hora, turno })}
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
      onClick={() => onBloquear({ fecha, hora })}
      className="h-full rounded-lg hover:bg-emerald-50 hover:border hover:border-emerald-200 transition-all cursor-pointer group"
    >
      <Plus size={12} className="text-emerald-400 opacity-0 group-hover:opacity-100 m-auto mt-2" />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AgendaProfesionalPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  const [semanaBase, setSemanaBase] = useState(fechaBase());
  const [vista, setVista] = useState("semana");

  const [turnos, setTurnos] = useState({});
  const [bloqueados, setBloqueados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalBloquear, setModalBloquear] = useState(null);
  const [modalNuevoTurno, setModalNuevoTurno] = useState(null); // eslint-disable-line

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

  useEffect(() => {
    if (!token) return;

    const fetchTurnos = async () => {
      setLoading(true);
      setError(null);

      try {
        const configReq = { headers: { Authorization: `Bearer ${token}` } };
        const dias = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

        const responses = await Promise.all(
          dias.map(d =>
            axios.get(`http://localhost:3001/api/profesional/turnos?fecha=${toKey(d)}`, configReq)
          )
        );

        const nuevosTurnos = {};
        responses.forEach((res, index) => {
          const fechaKey = toKey(dias[index]);
          if (res.data.ok && Array.isArray(res.data.data)) {
            const turnosDelDia = {};
            res.data.data.forEach(t => {
              const hora = t.horaInicio.slice(0, 5);
              turnosDelDia[hora] = {
                id: t.id,
                paciente: t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : "Paciente Nuevo",
                email: t.paciente?.email || "-",
                telefono: t.paciente?.telefono || "-",
                motivo: t.motivoConsulta || "Sin motivo especificado",
                modalidad: t.modalidad ? t.modalidad.charAt(0).toUpperCase() + t.modalidad.slice(1) : "Presencial",
                estado: t.estado,
                historial: [],
              };
            });
            nuevosTurnos[fechaKey] = turnosDelDia;
          }
        });

        setTurnos(nuevosTurnos);
      } catch (err) {
        console.error("Error fetching agenda:", err);
        if (err.response?.status === 401) {
          logout();
          navigate('/profesional/login');
        } else {
          setError("Error al cargar la agenda");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, [semanaBase, token]); // eslint-disable-line

  function prevSemana() { setSemanaBase(d => addDays(d, -7)); }
  function nextSemana() { setSemanaBase(d => addDays(d, 7)); }

  async function cambiarEstado(fecha, hora, nuevoEstado) {
    const turno = turnos[fecha]?.[hora];
    if (!turno) return;

    try {
      const configReq = { headers: { Authorization: `Bearer ${token}` } };
      let url = "";
      let body = {};

      if (nuevoEstado === "CONFIRMADO") {
        url = `http://localhost:3001/api/profesional/turnos/${turno.id}/confirmar`;
      } else if (nuevoEstado === "CANCELADO") {
        url = `http://localhost:3001/api/profesional/turnos/${turno.id}/rechazar`;
        body = { motivo: "Cancelado desde Agenda" };
      } else if (nuevoEstado === "AUSENTE") {
        url = `http://localhost:3001/api/profesional/turnos/${turno.id}/rechazar`;
        body = { motivo: "Ausente" };
        nuevoEstado = "cancelado";
      }

      const { data } = await axios.patch(url, body, configReq);

      if (data.ok) {
        setTurnos(t => ({
          ...t,
          [fecha]: {
            ...t[fecha],
            [hora]: { ...t[fecha][hora], estado: nuevoEstado.toLowerCase() },
          },
        }));
        setModalDetalle(null);
      }
    } catch (err) {
      console.error("Error actualizando estado", err);
      alert("No se pudo actualizar el estado del turno.");
    }
  }

  function bloquearHorario(fecha, hora) {
    setBloqueados(b => ({
      ...b,
      [fecha]: [...(b[fecha] || []), hora],
    }));
    setModalBloquear(null);
  }

  const inicioSemana = diasSemana[0];
  const finSemana = diasSemana[6];
  const labelSemana = `${inicioSemana.getDate()} - ${finSemana.getDate()} ${formatMes(finSemana)}`;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* Header */}
      <div className="shrink-0 h-14 bg-white border-b border-slate-100 flex items-center gap-3 px-4">
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

        <button onClick={() => setModalBloquear({ fecha: toKey(HOY), hora: "09:00" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors">
          <Lock size={13} /> Bloquear horario
        </button>
        <button onClick={() => setModalNuevoTurno({ fecha: toKey(HOY), hora: "09:00" })}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
          <Plus size={13} /> Turno manual
        </button>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Grilla */}
      {!loading && (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[700px] h-full flex flex-col">

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

            <div className="flex-1">
              {HORAS.map((hora) => (
                <div key={hora} className="grid border-b border-slate-100" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", height: 52 }}>
                  <div className="flex items-start justify-end pr-2 pt-1 border-r border-slate-100 shrink-0">
                    {hora.endsWith(":00") && (
                      <span className="text-xs text-slate-400 font-medium">{hora}</span>
                    )}
                  </div>
                  {diasSemana.map(d => {
                    const key = toKey(d);
                    const esHoy = key === toKey(HOY);
                    return (
                      <div key={key} className={`border-r border-slate-100 p-0.5 ${esHoy ? "bg-emerald-50/40" : ""}`}>
                        <Celda
                          fecha={key}
                          hora={hora}
                          turnos={turnos}
                          bloqueados={bloqueados}
                          onVerDetalle={setModalDetalle}
                          onBloquear={setModalBloquear}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
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

      {/* Modal Detalle */}
      {modalDetalle && (
        <Modal onClose={() => setModalDetalle(null)}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                {initials(modalDetalle.turno.paciente)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{modalDetalle.turno.paciente}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(ESTADO_CFG[modalDetalle.turno.estado] || ESTADO_CFG.pendiente).cls}`}>
                  {(ESTADO_CFG[modalDetalle.turno.estado] || ESTADO_CFG.pendiente).label}
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
              { icon: Clock,    label: "Hora",  val: `${modalDetalle.hora} hs` },
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

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Historial</p>
              <div className="flex gap-2 flex-wrap">
                {modalDetalle.turno.historial?.length > 0
                  ? modalDetalle.turno.historial.map((h, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{h}</span>
                    ))
                  : <span className="text-xs text-slate-400">Sin historial</span>
                }
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 grid grid-cols-2 gap-2">
            {modalDetalle.turno.estado.toLowerCase() === "pendiente" && (
              <button onClick={() => cambiarEstado(modalDetalle.fecha, modalDetalle.hora, "CONFIRMADO")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
                <CheckCircle2 size={14} /> Confirmar
              </button>
            )}
            {modalDetalle.turno.estado.toLowerCase() === "confirmado" && (
              <button onClick={() => cambiarEstado(modalDetalle.fecha, modalDetalle.hora, "AUSENTE")}
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

      {/* Modal Bloquear */}
      {modalBloquear && (
        <Modal onClose={() => setModalBloquear(null)}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Bloquear horario</h2>
            <button onClick={() => setModalBloquear(null)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-500">Bloqueá este horario para que los pacientes no puedan reservar.</p>
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