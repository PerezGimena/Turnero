import { useNavigate } from "react-router-dom";
import {
  Users, BarChart2, Calendar, DollarSign, UserPlus, CreditCard,
  TrendingUp, TrendingDown, Activity, ChevronRight, Wifi, Bell,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const metricas = [
  { label: "Profesionales activos", valor: "234",     sub: "+8 este mes",          trend: "up",   icon: Users,       color: "violet" },
  { label: "Turnos este mes",        valor: "12.847",  sub: "+23% vs anterior",     trend: "up",   icon: Calendar,    color: "blue" },
  { label: "Tasa de asistencia",     valor: "87.3%",   sub: "-0.4% vs anterior",    trend: "down", icon: Activity,    color: "emerald" },
  { label: "Ingresos del mes",       valor: "$94.200", sub: "ARS · comisiones",     trend: "up",   icon: DollarSign,  color: "amber" },
  { label: "Nuevos registros",       valor: "12",      sub: "Esta semana",          trend: "up",   icon: UserPlus,    color: "teal" },
  { label: "Planes activos",         valor: "198",     sub: "De 234 profesionales", trend: null,   icon: CreditCard,  color: "indigo" },
];

const graficoDatos = [
  { mes: "Sep", turnos: 8420  },
  { mes: "Oct", turnos: 9100  },
  { mes: "Nov", turnos: 7800  },
  { mes: "Dic", turnos: 6500  },
  { mes: "Ene", turnos: 10200 },
  { mes: "Feb", turnos: 12847 },
];

const ultimosProfesionales = [
  { id: 1, nombre: "Camila Torres",  especialidad: "Psicología",  registro: "2026-02-25", turnosMes: 43, plan: "Pro",    estado: "Activo"   },
  { id: 2, nombre: "Federico Ruiz",  especialidad: "Odontología", registro: "2026-02-22", turnosMes: 18, plan: "Básico", estado: "Activo"   },
  { id: 3, nombre: "Luciana Páez",   especialidad: "Pediatría",   registro: "2026-02-20", turnosMes: 67, plan: "Pro",    estado: "Activo"   },
  { id: 4, nombre: "Andrés Molina",  especialidad: "Cardiología", registro: "2026-02-18", turnosMes: 0,  plan: "Básico", estado: "Inactivo" },
  { id: 5, nombre: "Natalia Vega",   especialidad: "Nutrición",   registro: "2026-02-15", turnosMes: 31, plan: "Pro",    estado: "Activo"   },
];

const alertas = [
  { tipo: "pago",        msg: "3 profesionales con pagos fallidos",             icon: CreditCard, color: "red" },
  { tipo: "integracion", msg: "WhatsApp API desconectada para 2 cuentas",       icon: Wifi,       color: "amber" },
  { tipo: "recordatorio",msg: "5 errores en envío de recordatorios ayer",       icon: Bell,       color: "orange" },
];

const COLOR_CFG = {
  violet:  { bg: "bg-violet-100",  text: "text-violet-600"  },
  blue:    { bg: "bg-blue-100",    text: "text-blue-600"    },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-600"   },
  teal:    { bg: "bg-teal-100",    text: "text-teal-600"    },
  indigo:  { bg: "bg-indigo-100",  text: "text-indigo-600"  },
};

function formatFecha(f) {
  return new Date(f + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

// ── Mini gráfico SVG ──────────────────────────────────────────────────────────
function GraficoLinea({ datos }) {
  const max   = Math.max(...datos.map(d => d.turnos));
  const min   = Math.min(...datos.map(d => d.turnos));
  const w = 600, h = 140, pad = 20;
  const xStep = (w - pad * 2) / (datos.length - 1);

  function y(val) {
    return h - pad - ((val - min) / (max - min || 1)) * (h - pad * 2);
  }

  const points = datos.map((d, i) => ({ x: pad + i * xStep, y: y(d.turnos) }));
  const pathD  = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD  = `${pathD} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#grad)" />
      <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#8B5CF6" />
          <text x={p.x} y={h - 4}     textAnchor="middle" fontSize="11" fill="#94a3b8">{datos[i].mes}</text>
          <text x={p.x} y={p.y - 10}  textAnchor="middle" fontSize="10" fill="#6d28d9" fontWeight="600">
            {(datos[i].turnos / 1000).toFixed(1)}k
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Dashboard (sin AdminLayout propio, el layout viene de las rutas) ──────────
export default function DashboardAdminPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400">Resumen global de TurnoSalud</p>
        </div>
        <div className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
              ${a.color === "red"    ? "bg-red-50 border-red-200 text-red-700"       :
                a.color === "amber"  ? "bg-amber-50 border-amber-200 text-amber-700" :
                                       "bg-orange-50 border-orange-200 text-orange-700"}`}>
              <a.icon size={15} className="shrink-0" />
              <span className="flex-1">{a.msg}</span>
              <button className="text-xs font-semibold underline">Ver</button>
            </div>
          ))}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {metricas.map(m => {
          const cfg = COLOR_CFG[m.color];
          return (
            <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <m.icon size={16} className={cfg.text} />
                </div>
                {m.trend === "up"   && <TrendingUp   size={14} className="text-emerald-500" />}
                {m.trend === "down" && <TrendingDown size={14} className="text-red-400"     />}
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5">{m.valor}</p>
              <p className="text-xs font-semibold text-slate-500">{m.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Gráfico + Últimos profesionales */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Turnos por mes</h2>
              <p className="text-xs text-slate-400">Últimos 6 meses</p>
            </div>
            <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full">
              +23% vs anterior
            </span>
          </div>
          <GraficoLinea datos={graficoDatos} />
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Últimos registros</h2>
            <button onClick={() => navigate("/admin/profesionales")}
              className="text-xs text-violet-600 font-semibold flex items-center gap-0.5 hover:underline">
              Ver todos <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {ultimosProfesionales.map(p => (
              <div key={p.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/profesionales")}>
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0">
                  {p.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.especialidad}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.plan === "Pro" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                  }`}>{p.plan}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{formatFecha(p.registro)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Profesionales registrados recientemente</h2>
          <button onClick={() => navigate("/admin/profesionales")}
            className="text-xs text-violet-600 font-semibold hover:underline flex items-center gap-0.5">
            Ver gestión completa <ChevronRight size={12} />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Nombre","Especialidad","Registro","Turnos mes","Plan","Estado","Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ultimosProfesionales.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0">
                      {p.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-semibold text-slate-800 text-xs">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">{p.especialidad}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{formatFecha(p.registro)}</td>
                <td className="px-5 py-3 text-xs font-semibold text-slate-700">{p.turnosMes}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    p.plan === "Pro" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                  }`}>{p.plan}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold ${p.estado === "Activo" ? "text-emerald-600" : "text-red-400"}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => navigate("/admin/profesionales")}
                    className="text-xs text-violet-600 font-semibold hover:underline">
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}