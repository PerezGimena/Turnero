import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore.jsx";
import {
  Settings2, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Info,
  CreditCard, Smartphone, MessageCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

if (!API) {
  throw new Error("VITE_API_URL no está definida");
}

const CAMPOS = [
  {
    seccion: "mercadopago",
    titulo: "MercadoPago",
    subtitulo: "OAuth 2.0 — Marketplace / Connect",
    color: "sky",
    icon: CreditCard,
    campos: [
      {
        key: "MP_CLIENT_ID",
        label: "Client ID (APP_ID)",
        tipo: "text",
        placeholder: "123456789012345",
        ayuda: "Obtenlo en mercadopago.com/developers → Tu aplicación → Credenciales de producción",
      },
      {
        key: "MP_CLIENT_SECRET",
        label: "Client Secret",
        tipo: "password",
        placeholder: "ABC123...",
        ayuda: "Nunca compartas este valor. Se almacena cifrado.",
      },
    ],
    redirectUri: (apiUrl) => `${apiUrl}/api/mp/oauth/callback`,
    docUrl: "https://www.mercadopago.com.ar/developers/es/docs/getting-started",
  },
  {
    seccion: "stripe",
    titulo: "Stripe Connect",
    subtitulo: "OAuth 2.0 — Standard / Express Connect",
    color: "violet",
    icon: Smartphone,
    campos: [
      {
        key: "STRIPE_CLIENT_ID",
        label: "Client ID (ca_...)",
        tipo: "text",
        placeholder: "ca_AbCdEfGhIjKlMn...",
        ayuda: "En Stripe Dashboard → Connect → Overview → Client ID",
      },
      {
        key: "STRIPE_SECRET_KEY",
        label: "Secret Key (sk_live_...)",
        tipo: "password",
        placeholder: "sk_live_...",
        ayuda: "En Stripe Dashboard → Developers → API Keys. Nunca expongas esta clave.",
      },
    ],
    redirectUri: (apiUrl) => `${apiUrl}/api/stripe/oauth/callback`,
    docUrl: "https://stripe.com/docs/connect/oauth-reference",
  },
  {
    seccion: "whatsapp",
    titulo: "WhatsApp Business (Twilio)",
    subtitulo: "Proveedor centralizado para recordatorios de todos los profesionales",
    color: "emerald",
    icon: MessageCircle,
    campos: [
      {
        key: "TWILIO_ACCOUNT_SID",
        label: "Account SID",
        tipo: "text",
        placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        ayuda: "Twilio Console → Account Info → Account SID",
      },
      {
        key: "TWILIO_AUTH_TOKEN",
        label: "Auth Token",
        tipo: "password",
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        ayuda: "Twilio Console → Account Info → Auth Token",
      },
      {
        key: "TWILIO_WHATSAPP_FROM",
        label: "Número emisor",
        tipo: "text",
        placeholder: "whatsapp:+14155238886",
        ayuda: "Formato obligatorio: whatsapp:+<codigoPais><numero>",
      },
    ],
    docUrl: "https://www.twilio.com/docs/whatsapp",
  },
];

const colorClasses = {
  sky: {
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-200",
    header: "bg-sky-50 border-b border-sky-100",
    focus: "focus:ring-sky-500 focus:border-sky-500",
    check: "text-sky-600",
    dot: "bg-sky-500",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-200",
    header: "bg-violet-50 border-b border-violet-100",
    focus: "focus:ring-violet-500 focus:border-violet-500",
    check: "text-violet-600",
    dot: "bg-violet-500",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    header: "bg-emerald-50 border-b border-emerald-100",
    focus: "focus:ring-emerald-500 focus:border-emerald-500",
    check: "text-emerald-600",
    dot: "bg-emerald-500",
  },
};

export default function IntegracionesAdminPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [estado, setEstado] = useState(null);       // datos del GET
  const [form, setForm]     = useState({});          // valores editados
  const [mostrar, setMostrar] = useState({});        // visibilidad contraseñas
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState(null);

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Falta VITE_API_URL");
}

const apiPublicUrl = API_URL.replace(/\/api$/, "");


  useEffect(() => {
    axios
      .get(`${API}/admin/integraciones`, { headers })
      .then((r) => setEstado(r.data.data))
      .catch(() => setError("No se pudo cargar la configuración actual."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (clave, valor) => {
    setForm((prev) => ({ ...prev, [clave]: valor }));
    setGuardado(false);
    setError(null);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await axios.put(`${API}/admin/integraciones`, form, { headers });
      // Recargar estado para reflejar configurado/no-configurado
      const r = await axios.get(`${API}/admin/integraciones`, { headers });
      setEstado(r.data.data);
      setForm({});
      setGuardado(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
          <Settings2 size={18} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Integraciones de plataforma</h1>
          <p className="text-sm text-slate-500">Pagos (MercadoPago/Stripe) y WhatsApp Business (Twilio)</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-5 mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Estas credenciales habilitan integraciones globales de la plataforma: pagos OAuth por profesional y
          WhatsApp centralizado para recordatorios. Las claves secretas se almacenan en la base de datos y se usan únicamente en el servidor.
          Nunca se exponen al frontend.
        </p>
      </div>

      {/* Secciones por plataforma */}
      <div className="space-y-6">
        {CAMPOS.map((seccion) => {
          const cl = colorClasses[seccion.color];
          const configurado =
            seccion.seccion === "mercadopago"
              ? estado?.mpConfigurado
              : seccion.seccion === "stripe"
                ? estado?.stripeConfigurado
                : estado?.whatsappConfigurado;

          return (
            <div
              key={seccion.seccion}
              className={`rounded-2xl border ${cl.border} bg-white shadow-sm overflow-hidden`}
            >
              {/* Header de sección */}
              <div className={`${cl.header} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <seccion.icon size={18} className="text-slate-600" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700">{seccion.titulo}</h2>
                    <p className="text-xs text-slate-500">{seccion.subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {configurado ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                      <CheckCircle2 size={12} /> Configurado
                    </span>
                  ) : (
                    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${cl.badge}`}>
                      Sin configurar
                    </span>
                  )}
                </div>
              </div>

              {/* Campos */}
              <div className="px-5 py-4 space-y-4">
                {seccion.campos.map((campo) => {
                  const esPassword = campo.tipo === "password";
                  const visible = mostrar[campo.key];
                  const valor = form[campo.key] ?? "";
                  const estaConfigurado = estado?.[campo.key];

                  return (
                    <div key={campo.key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {campo.label}
                      </label>
                      <div className="relative">
                        <input
                          type={esPassword && !visible ? "password" : "text"}
                          value={valor}
                          onChange={(e) => handleChange(campo.key, e.target.value)}
                          placeholder={
                            estaConfigurado
                              ? "• Configurado — ingresa nuevo valor para actualizar •"
                              : campo.placeholder
                          }
                          className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-2 ${cl.focus} transition pr-9`}
                        />
                        {esPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              setMostrar((p) => ({ ...p, [campo.key]: !p[campo.key] }))
                            }
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{campo.ayuda}</p>
                    </div>
                  );
                })}

                {seccion.redirectUri && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Redirect URI (registrar en la plataforma)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={seccion.redirectUri(apiPublicUrl)}
                        className="flex-1 rounded-lg border border-dashed border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-600 font-mono select-all outline-none"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Copiá esta URL y registrala como "Redirect URI" en el dashboard de{" "}
                      <a
                        href={seccion.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline font-medium ${
                          seccion.color === "sky" ? "text-sky-600" : seccion.color === "violet" ? "text-violet-600" : "text-emerald-600"
                        }`}
                      >
                        {seccion.titulo}
                      </a>
                      .
                    </p>
                  </div>
                )}

                {!seccion.redirectUri && (
                  <p className="text-xs text-slate-400">
                    Documentación oficial de configuración:{" "}
                    <a
                      href={seccion.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium text-emerald-600"
                    >
                      {seccion.titulo}
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-4 flex gap-2 items-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}
      {guardado && (
        <div className="mt-4 flex gap-2 items-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={15} className="shrink-0" />
          Credenciales guardadas correctamente.
        </div>
      )}

      {/* Botón guardar */}
      <div className="mt-6">
        <button
          onClick={handleGuardar}
          disabled={guardando || Object.keys(form).every((k) => !form[k])}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Save size={15} />
          {guardando ? "Guardando..." : "Guardar credenciales"}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Solo se actualizan los campos que hayas completado. Dejar vacío = mantener valor actual.
        </p>
      </div>
    </div>
  );
}
