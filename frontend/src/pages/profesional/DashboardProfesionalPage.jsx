import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from '../../store/useAuthStore';
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
  Loader2,
  MoreHorizontal,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";

// ── Paleta profesional: slate oscuro + verde accent ───────────────────────────
// bg: #0F172A (slate-900), accent: #10B981 (emerald-500)

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_CFG = {
  confirmado: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-700" },
  pendiente:  { label: "Pendiente",  cls: "bg-amber-100 text-amber-700" },
  cancelado:  { label: "Cancelado",  cls: "bg-red-100 text-red-500" },
  ausente:    { label: "Ausente",    cls: "bg-gray-100 text-gray-500" },
  completado: { label: "Completado", cls: "bg-blue-100 text-blue-700" },
  // Fallback para mayúsculas si el backend lo enviara así
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
  if (!nombre) return "";
  return nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardProfesionalPage() {
  const navigate = useNavigate();
  const { token, usuario, logout } = useAuthStore();
  
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [pendientesConfirmacion, setPendientesConfirmacion] = useState([]);
  const [metricasData, setMetricasData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para UI
  const [modalNuevoTurno, setModalNuevoTurno] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]); // A futuro conectar con API
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const copiarLink = () => {
    const url = `${window.location.origin}/${usuario?.slug}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Form nuevo turno
  const [formTurno, setFormTurno] = useState({
    pacienteNombre: "", // Input texto visible
    pacienteId: null,   // ID si selecciono existente
    fecha: "", 
    hora: "", 
    modalidad: "presencial", // lowercase para coincidir con backend enum
    motivo: "",
  });
  
  // Busqueda pacientes
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  // Fetch data inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate('/profesional/login');
          return;
        }
        
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const hoyStr = new Date().toISOString().split('T')[0];

        // Fetch paralelo: Metricas + Turnos Hoy + Pendientes
        const [resMetricas, resTurnosHoy, resPendientes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/profesional/dashboard/metricas`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/profesional/turnos?fecha=${hoyStr}`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/profesional/turnos?estado=pendiente&limit=5`, config)
        ]);

        if (resMetricas.data.ok) setMetricasData(resMetricas.data.data);
        if (resTurnosHoy.data.ok) setTurnosHoy(resTurnosHoy.data.data);
        if (resPendientes.data.ok) setPendientesConfirmacion(resPendientes.data.data);

        // Notificaciones vacías por ahora, conectar con API a futuro
        setNotificaciones([]);

      } catch (err) {
        console.error("Error cargando dashboard:", err);
        if (err.response?.status === 401) {
           logout();
           navigate('/profesional/login');
        } else {
           setError("No se pudieron cargar los datos del dashboard.");
        }
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [token, navigate, logout]);

  // Busqueda de pacientes (Efecto tipo debounce simple)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
        if (busqueda.length > 2) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/profesional/pacientes?busqueda=${busqueda}`, config);
                if (data.ok) {
                    setSugerencias(data.data);
                }
            } catch (error) {
                console.error("Error buscando pacientes", error);
            }
        } else {
            setSugerencias([]);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, token]);


  async function guardarTurno() {
      try {
          // Validacion basica
          if (!formTurno.fecha || !formTurno.hora || !formTurno.pacienteNombre) return;

          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          // Construir payload
          // Si tenemos ID, lo mandamos. Si el backend soporta crear paciente al vuelo solo con nombre, mandamos nombre.
          // Asumiremos que el backend requiere 'pacienteId' O datos completos de paciente.
          // Para este fix rapido, si no hay ID, simulamos un objeto paciente parcial
          const payload = {
            fecha: formTurno.fecha,
            horaInicio: formTurno.hora,
            modalidad: formTurno.modalidad,
            motivoConsulta: formTurno.motivo,
            // Datos del paciente
            pacienteId: formTurno.pacienteId,
            paciente: !formTurno.pacienteId ? { 
                nombre: formTurno.pacienteNombre.split(" ")[0], 
                apellido: formTurno.pacienteNombre.split(" ").slice(1).join(" ") || "-" 
            } : undefined
          };

          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/profesional/turnos`, payload, config);

          if (data.ok) {
              setModalNuevoTurno(false);
              // Recargar turnos si es fecha de hoy
              const hoyStr = new Date().toISOString().split('T')[0];
              if (formTurno.fecha === hoyStr) {
                  const res = await axios.get(`${import.meta.env.VITE_API_URL}/profesional/turnos?fecha=${hoyStr}`, config);
                  if (res.data.ok) setTurnosHoy(res.data.data);
              }
              // Reset form
              setFormTurno({ pacienteNombre: "", pacienteId: null, fecha: "", hora: "", modalidad: "presencial", motivo: "" });
              setBusqueda("");
          }

      } catch (err) {
          console.error("Error creando turno", err);
          alert("Error al crear turno. Verificá los datos.");
      }
  }



  async function confirmarTurno(id) {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/profesional/turnos/${id}/confirmar`, {}, config);
        
        if (data.ok) {
             setTurnosHoy(prev => prev.map(t => t.id === id ? { ...t, estado: "confirmado" } : t));
        }
    } catch (err) {
        console.error("Error al confirmar turno", err);
        alert("Error al confirmar turno");
    }
  }

  // TODO: Implementar endpoint real para marcar ausente/cancelar
  async function marcarAusente(id) {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Usamos rechazar como cancelar por ahora, o implementamos patch especifico
        const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/profesional/turnos/${id}/rechazar`, { motivo: "Ausente" }, config);
        if (data.ok) {
            setTurnosHoy(prev => prev.map(t => t.id === id ? { ...t, estado: "cancelado" } : t));
        }
    } catch (err) {
        console.error("Error al marcar ausente", err);
    }
  }

  // Construccion del array de metricas para renderizar
  const metricasVisuales = [
    {
      label: "Turnos hoy",
      valor: metricasData?.turnosHoy || 0,
      sub: "Programados para hoy",
      trend: null,
      icon: Calendar,
      color: "emerald",
    },
    {
      label: "Pendientes",
      valor: metricasData?.pendientes || 0,
      sub: "Requieren acción",
      trend: null,
      icon: AlertCircle,
      color: "amber",
    },
    // Estas métricas podrian venir del backend en un futuro
    {
      label: "Pacientes",
      valor: metricasData?.totalPacientes || "-",
      sub: "Total histórico",
      trend: "up",
      icon: TrendingUp,
      color: "blue",
    },
    {
      label: "Ausencias",
      valor: metricasData?.tasaAusentismo ? `${metricasData.tasaAusentismo}%` : "-",
      sub: "Tasa mensual",
      trend: "down",
      icon: UserX,
      color: "red",
    },
  ];

  /* 
     Helpers y lógica de UI (modales, etc) se mantienen igual, 
     pero usando la función de crear turno real si se implementara (mock por ahora en el boton +)
  */

  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  if (cargando) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
      )
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Topbar ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Buen día, Dr. {usuario?.nombre || "Profesional"} 👋
          </h1>
          <p className="text-xs text-slate-400 capitalize">{hoy}</p>
          
          {usuario?.slug && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">
                Tu link de reservas: <span className="font-medium text-slate-700">https://tudominio.com/{usuario.slug}</span>
              </p>
              <button 
                onClick={copiarLink}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                title="Copiar al portapapeles"
              >
                {copiado ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                <span className={`text-[10px] font-bold ${copiado ? "text-emerald-600" : "text-slate-500"}`}>
                  {copiado ? "¡Copiado!" : "Copiar"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Boton generar turno manual (sin conectar aun al POST real en este paso específico) */}
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

        {/* ── ERROR ── */}
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{error}</p>
            </div>
        )}

        {/* ── Métricas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricasVisuales.map((m) => {
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

            {turnosHoy.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 flex flex-col items-center text-center">
                <Calendar size={28} className="text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-500">No tenés turnos para hoy</p>
                <p className="text-xs text-slate-400 mt-1">Podés crear un turno manual desde el botón superior</p>
              </div>
            ) : (
              <div className="space-y-2">
                {turnosHoy.map((turno) => {
                  const estadoKey = turno.estado.toLowerCase();
                  const est = ESTADO_CFG[estadoKey] || ESTADO_CFG.PENDIENTE;
                  const pacienteNombre = turno.paciente ? `${turno.paciente.nombre} ${turno.paciente.apellido}` : "Paciente desconocido";
                  
                  return (
                    <div
                      key={turno.id}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                        ${estadoKey === "cancelado" ? "border-slate-100 opacity-60" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Hora */}
                        <div className="shrink-0 text-center w-14">
                          <p className="text-sm font-bold text-slate-800">{turno.horaInicio}</p>
                          <p className="text-xs text-slate-400">{turno.horaFin}</p>
                        </div>

                        {/* Separador vertical */}
                        <div className={`w-0.5 h-10 rounded-full shrink-0 ${
                          estadoKey === "confirmado" ? "bg-emerald-400" :
                          estadoKey === "pendiente" ? "bg-amber-400" : "bg-slate-200"
                        }`} />

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {initials(pacienteNombre)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800">{pacienteNombre}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${est.cls}`}>
                              {est.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {turno.motivoConsulta && (
                              <p className="text-xs text-slate-400 truncate">{turno.motivoConsulta}</p>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                              {turno.modalidad === "virtual" // Ajuste minúscula Backend
                                ? <Video size={11} />
                                : <MapPin size={11} />
                              }
                              <span className="capitalize">{turno.modalidad}</span>
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {estadoKey === "pendiente" && (
                            <button
                              onClick={() => confirmarTurno(turno.id)}
                              className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={13} />
                              Confirmar
                            </button>
                          )}
                          {(estadoKey === "confirmado" || estadoKey === "pendiente") && (
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
                {pendientesConfirmacion.length === 0 ? (
                   <p className="text-xs text-slate-400 p-4 text-center">No hay turnos pendientes</p>
                ) : (
                  pendientesConfirmacion.map((p) => {
                    const nombreP = p.paciente ? `${p.paciente.nombre} ${p.paciente.apellido}` : "Desconocido";
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {initials(nombreP)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{nombreP}</p>
                          <p className="text-xs text-slate-400">{p.fecha} · {p.horaInicio}</p>
                        </div>
                        <button
                          onClick={() => confirmarTurno(p.id)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
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
                {notificaciones.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">Sin notificaciones nuevas</p>
                ) : (
                  notificaciones.map((n, i) => (
                    <div key={n.id || i} className="px-4 py-3">
                      <p className="text-xs text-slate-600 leading-relaxed">{n.texto}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.hace}</p>
                    </div>
                  ))
                )}
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
                    value={busqueda || formTurno.pacienteNombre}
                    onChange={e => { 
                      setBusqueda(e.target.value); 
                      setFormTurno(f => ({ ...f, pacienteNombre: "", pacienteId: null })); 
                    }}
                    placeholder="Buscá por nombre o DNI..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  {sugerencias.length > 0 && busqueda.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                      {sugerencias.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => { 
                            const nombreCompleto = `${s.nombre} ${s.apellido}`;
                            setFormTurno(f => ({ ...f, pacienteNombre: nombreCompleto, pacienteId: s.id })); 
                            setBusqueda(""); 
                            setSugerencias([]);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 text-sm text-slate-700 text-left transition-colors border-b border-slate-50 last:border-0"
                        >
                          <User size={13} className="text-slate-400 shrink-0" /> 
                          <span className="truncate">{s.nombre} {s.apellido} <span className="text-slate-400 text-xs">({s.dni})</span></span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Si no hay sugerencias y escribimos algo largo, opción de crear paciente visualmente (mock funcional) */}
                  {sugerencias.length === 0 && busqueda.length > 3 && (
                     <button 
                        onClick={() => {
                            setFormTurno(f => ({ ...f, pacienteNombre: busqueda, pacienteId: null }));
                            setBusqueda("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold hover:underline bg-white px-2"
                     >
                        Usar "{busqueda}"
                     </button>
                  )}
                </div>
                {formTurno.pacienteNombre && !busqueda && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 size={11} /> {formTurno.pacienteNombre} {formTurno.pacienteId ? '(Registrado)' : '(Nuevo)'}
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
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hora Inicio<span className="text-emerald-500">*</span></label>
                  <input type="time" value={formTurno.hora}
                    onChange={e => setFormTurno(f => ({ ...f, hora: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Modalidad</label>
                <div className="flex gap-2">
                  {["Presencial", "Virtual"].map(m => (
                    <button key={m} onClick={() => setFormTurno(f => ({ ...f, modalidad: m.toLowerCase() }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all capitalize
                        ${formTurno.modalidad === m.toLowerCase() ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Notas <span className="text-slate-400 font-normal">— opcional</span>
                </label>
                <textarea rows={2} value={formTurno.motivo}
                  onChange={e => setFormTurno(f => ({ ...f, motivo: e.target.value }))}
                  placeholder="Motivo, indicaciones previas..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none" />
              </div>
            </div>

            {/* Footer modal */}
            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={guardarTurno}
                disabled={!formTurno.pacienteNombre || !formTurno.fecha || !formTurno.hora}
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