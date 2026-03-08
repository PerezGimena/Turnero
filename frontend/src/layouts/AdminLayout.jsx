import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BarChart2, MessageSquare, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",         path: "/admin/dashboard" },
  { icon: Users,           label: "Profesionales",     path: "/admin/profesionales" },
  { icon: BarChart2,       label: "Métricas globales", path: "/admin/metricas" },
  { icon: MessageSquare,   label: "Soporte",           path: "/admin/soporte" },
  { icon: Settings,        label: "Configuración",     path: "/admin/configuracion" },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-violet-950 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-violet-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">TurnoSalud</p>
              <p className="text-violet-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-violet-500 text-white shadow-sm"
                    : "text-violet-300 hover:bg-violet-900 hover:text-white"
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-violet-900">
          <div className="flex items-center gap-2.5 px-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-violet-200 font-bold text-xs">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Admin</p>
              <p className="text-xs text-violet-400">admin@turnosalud.com</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-violet-400 hover:bg-violet-900 hover:text-white transition-all">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido (páginas hijas via Outlet) ── */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}