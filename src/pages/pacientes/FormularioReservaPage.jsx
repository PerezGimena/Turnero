
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Bell,
} from "lucide-react";
import axios from "axios";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function validar(form, profesional) {
  const errores = {};

  if (!form.nombre || form.nombre.trim().length < 2)
    errores.nombre = "Ingresá tu nombre (mín. 2 caracteres)";

  if (!form.apellido || form.apellido.trim().length < 2)
    errores.apellido = "Ingresá tu apellido (mín. 2 caracteres)";

  if (!form.telefono || !/^\+?549?\d{10}$/.test(form.telefono.replace(/\s/g, "")))
    errores.telefono = "Formato válido: +54 9 11 12345678";

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errores.email = "Ingresá un email válido";

  // 🔥 SOLO validar si tiene obra social
  if (profesional?.aceptaObrasSociales && form.tieneObraSocial) {
    if (!form.obraSocial)
      errores.obraSocial = "Seleccioná tu obra social";

    if (!form.numeroAfiliado || form.numeroAfiliado.trim().length < 3)
      errores.numeroAfiliado = "Ingresá tu número de afiliado";
  }

  if (form.motivoConsulta && form.motivoConsulta.length > 300)
    errores.motivoConsulta = "Máximo 300 caracteres";

  return errores;
}
// ── Input base ────────────────────────────────────────────────────────────────
function Field({ label, required, error, icon: Icon, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
        {label}
        {required && <span className="text-blue-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
        {children}
      </div>
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasIcon, error) =>
  `w-full rounded-lg border text-sm py-2.5 pr-3 outline-none transition-all bg-white
  ${hasIcon ? "pl-9" : "pl-3"}
  ${error
    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
    : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
  }`;

// ── Componente principal ──────────────────────────────────────────────────────
export default function FormularioReservaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fecha = searchParams.get("fecha");
  const hora = searchParams.get("hora");

  const [profesional, setProfesional] = useState(null);
  const [loadingProfesional, setLoadingProfesional] = useState(true);
  const [errorLoad, setErrorLoad] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchProfesional = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/api/publico/${slug}`);
        if (data.ok) {
          setProfesional(data.data);
        } else {
          setErrorLoad("No se pudo cargar la información del profesional.");
        }
      } catch (err) {
        console.error("Error al cargar profesional:", err);
        setErrorLoad("No se pudo cargar la información del profesional.");
      } finally {
        setLoadingProfesional(false);
      }
    };
    fetchProfesional();
  }, [slug]);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "+54 9 ",
    email: "",
    dni: "",
    tieneObraSocial: false,
    obraSocial: "",
    numeroAfiliado: "",
    motivoConsulta: "",
    aceptaRecordatorios: true,
  });

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState(null);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errores[key]) setErrores((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit() {
    setErrorSubmit(null);
    const errs = validar(form, profesional);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setEnviando(true);

    try {
const payload = {
  fecha,
  horaInicio: hora,
  modalidad: ({ 'Presencial': 'presencial', 'Virtual': 'virtual', 'Presencial y Virtual': 'ambas' })[profesional?.modalidad] || 'presencial',
  motivoConsulta: form.motivoConsulta,
paciente: {
  nombre: form.nombre.trim(),
  apellido: form.apellido.trim(),
  email: form.email.trim(),
  telefono: form.telefono.trim(),
  dni: form.dni?.trim() || "",
  obraSocial: String(form.tieneObraSocial ? form.obraSocial || "" : ""),
  numeroAfiliado: String(form.tieneObraSocial ? form.numeroAfiliado || "" : ""),
}
};

      const response = await axios.post(`http://localhost:3001/api/publico/${slug}/reservar`, payload);

      if (response.data.ok) {
        const turnoCreado = response.data.data;
        setEnviado(true);

        const destino = (turnoCreado.turno?.estado === 'confirmado' || turnoCreado.estado === 'confirmado')
  ? `/${slug}/reservar/confirmado`
  : `/${slug}/reservar/pendiente`;

setTimeout(() => {
  navigate(`${destino}?fecha=${fecha}&hora=${hora}`, {
    state: { 
      turno: turnoCreado, 
      paciente: form,
      profesional
    }
  });
}, 800);
      }

    } catch (err) {
      console.error("Error al reservar:", err);
      const msg = err.response?.data?.message || "Ocurrió un error al procesar tu reserva. Intentalo nuevamente.";
      setErrorSubmit(msg);
    } finally {
      setEnviando(false);
    }
  }

  // Loading
  if (loadingProfesional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (errorLoad || !profesional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-4">{errorLoad || "Profesional no encontrado"}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              Completá tus datos
            </p>
            <p className="text-xs text-gray-400">Paso 2 de 3</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">

        {/* ── Card resumen turno ── */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-3">
            Tu turno
          </p>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {profesional.nombre?.[0]}{profesional.apellido?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Dr. {profesional.nombre} {profesional.apellido}</p>
              <p className="text-blue-200 text-xs">{profesional.especialidad}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-blue-500/50 rounded-lg px-3 py-1.5">
              <Calendar size={13} className="text-blue-200" />
              <span className="text-xs font-medium capitalize">{formatFecha(fecha)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-500/50 rounded-lg px-3 py-1.5">
              <Clock size={13} className="text-blue-200" />
              <span className="text-xs font-medium">{hora} · {profesional.duracionTurno} min</span>
            </div>
          </div>
        </div>

        {/* ── Datos personales ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <User size={15} className="text-blue-500" />
            Datos personales
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" required error={errores.nombre}>
              <input
                id="nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ej: Lucas"
                className={inputClass(false, errores.nombre)}
              />
            </Field>
            <Field label="Apellido" required error={errores.apellido}>
              <input
                id="apellido"
                type="text"
                value={form.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                placeholder="Ej: Ramírez"
                className={inputClass(false, errores.apellido)}
              />
            </Field>
          </div>

          <Field
            label="Teléfono"
            required
            error={errores.telefono}
            icon={Phone}
            hint="Formato: +54 9 11 12345678"
          >
            <input
              id="telefono"
              type="tel"
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="+54 9 11 12345678"
              className={inputClass(true, errores.telefono)}
            />
          </Field>

          <Field label="Email" required error={errores.email} icon={Mail}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
              className={inputClass(true, errores.email)}
            />
          </Field>

          <Field label="DNI" error={errores.dni} icon={CreditCard} hint="Opcional">
            <input
              id="dni"
              type="text"
              value={form.dni}
              onChange={(e) => set("dni", e.target.value)}
              placeholder="12345678"
              className={inputClass(true, errores.dni)}
            />
          </Field>
        </section>

        {/* ── Obra social ── */}
        {profesional.aceptaObrasSociales && (
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Shield size={15} className="text-blue-500" />
              Obra social
            </h2>

            <button
              onClick={() => {
                set("tieneObraSocial", !form.tieneObraSocial);
                set("obraSocial", "");
                set("numeroAfiliado", "");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium
                ${form.tieneObraSocial
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
            >
              <span>¿Tenés obra social?</span>
              <div
                className={`w-10 h-5 rounded-full transition-all relative ${
                  form.tieneObraSocial ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    form.tieneObraSocial ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
            </button>

            {form.tieneObraSocial && (
              <div className="space-y-3">
                <Field label="Obra social" required error={errores.obraSocial}>
                  <select
                    id="obraSocial"
                    value={form.obraSocial}
                    onChange={(e) => set("obraSocial", e.target.value)}
                    className={`${inputClass(false, errores.obraSocial)} cursor-pointer`}
                  >
                    <option value="">Seleccioná tu obra social</option>
                    {profesional.obrasSociales?.map((os) => (
                      <option key={os} value={os}>{os}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Número de afiliado" 
                 required 
                 error={errores.numeroAfiliado}
>
                  <input
                    type="text"
                    value={form.numeroAfiliado}
                    onChange={(e) => set("numeroAfiliado", e.target.value)}
                    placeholder="Ej: 123456789"
                    className={inputClass(false, errores.numeroAfiliado)}
                  />
                </Field>
              </div>
            )}
          </section>
        )}

        {/* ── Motivo de consulta ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText size={15} className="text-blue-500" />
            Motivo de consulta
            <span className="text-xs font-normal text-gray-400 ml-1">— opcional</span>
          </h2>

          <Field error={errores.motivoConsulta}>
            <textarea
              value={form.motivoConsulta}
              onChange={(e) => set("motivoConsulta", e.target.value)}
              placeholder="Describí brevemente el motivo de tu consulta..."
              rows={3}
              className={`w-full rounded-lg border text-sm py-2.5 px-3 outline-none transition-all bg-white resize-none
                ${errores.motivoConsulta
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${form.motivoConsulta.length > 280 ? "text-red-400" : "text-gray-400"}`}>
                {form.motivoConsulta.length}/300
              </span>
            </div>
          </Field>
        </section>

        {/* ── Pago anticipado ── */}
        {profesional.pagoObligatorio && (
          <section className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <CreditCard size={15} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Pago anticipado requerido</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  El turno se confirma una vez acreditado el pago.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-amber-700 font-medium">Monto a abonar</span>
              <span className="text-lg font-bold text-amber-700">
                ${profesional.montoPorTurno?.toLocaleString("es-AR")}
              </span>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              Pagar con MercadoPago
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-medium">
              <AlertCircle size={12} />
              Pago requerido para confirmar el turno
            </div>
          </section>
        )}

        {/* ── Recordatorios ── */}
        <button
          onClick={() => set("aceptaRecordatorios", !form.aceptaRecordatorios)}
          className="w-full flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm text-left transition-colors hover:border-blue-200"
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
            form.aceptaRecordatorios ? "bg-blue-600 border-blue-600" : "border-gray-300"
          }`}>
            {form.aceptaRecordatorios && <CheckCircle2 size={12} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Bell size={12} className="text-blue-400" />
              Aceptar recordatorios
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Te avisamos por WhatsApp y email antes del turno.
            </p>
          </div>
        </button>

        {/* ── Error submit ── */}
        {errorSubmit && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{errorSubmit}</p>
          </div>
        )}

      </main>

      {/* ── Footer fijo ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={enviando || enviado}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all
              ${enviado
                ? "bg-green-500 text-white"
                : enviando
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.98]"
              }`}
          >
            {enviado ? (
              <>
                <CheckCircle2 size={16} />
                Turno reservado
              </>
            ) : enviando ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Reservando...
              </>
            ) : (
              <>
                Reservar turno
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}