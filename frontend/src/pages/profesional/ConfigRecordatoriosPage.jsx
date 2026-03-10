import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Save, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const ConfiguracionRecordatorios = () => {
  // Paleta de colores profesional
  const brand = { DEFAULT: '#10B981', dark: '#059669', light: '#ECFDF5' };

  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [config, setConfig] = useState({
    emailActive: true,
    whatsappActive: false,
    whatsappNumber: '',
    r1: true,
    r1Time: 24,
    r2: true,
    r2Time: 2,
    r3: false,
    r3Time: 72,
    confirmacionAuto: true,
    notifAusencia: false,
    msgEmail: "Hola {{nombre}}, te recordamos tu turno el día {{fecha}} a las {{hora}}.",
    msgWhatsapp: "¡Hola {{nombre}}! 👋 Te recordamos tu cita de hoy a las {{hora}}. ¿Confirmas tu asistencia?"
  });

  useEffect(() => {
    axios.get('http://localhost:3001/api/profesional/recordatorios/config', { headers })
      .then(({ data }) => {
        const d = data.data;
        setConfig(c => ({
          ...c,
          emailActive: d.emailHabilitado ?? true,
          whatsappActive: d.whatsappHabilitado ?? false,
          whatsappNumber: d.whatsappNumero || '',
          r1: d.recordatorio1Habilitado ?? true,
          r1Time: d.recordatorio1HorasAntes ?? 24,
          r2: d.recordatorio2Habilitado ?? false,
          r2Time: d.recordatorio2HorasAntes ?? 2,
          r3: d.recordatorio3Habilitado ?? false,
          r3Time: d.recordatorio3HorasAntes ?? 72,
          notifAusencia: d.recordatorioAusencia ?? false,
          msgEmail: d.mensajeEmail || c.msgEmail,
          msgWhatsapp: d.mensajeWhatsapp || c.msgWhatsapp,
        }));
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [token]);

  async function guardar() {
    setGuardando(true);
    try {
      await axios.put('http://localhost:3001/api/profesional/recordatorios/config', {
        emailHabilitado: config.emailActive,
        whatsappHabilitado: config.whatsappActive,
        whatsappNumero: config.whatsappNumber,
        recordatorio1Habilitado: config.r1,
        recordatorio1HorasAntes: config.r1Time,
        recordatorio2Habilitado: config.r2,
        recordatorio2HorasAntes: config.r2Time,
        recordatorio3Habilitado: config.r3,
        recordatorio3HorasAntes: config.r3Time,
        recordatorioAusencia: config.notifAusencia,
        mensajeEmail: config.msgEmail,
        mensajeWhatsapp: config.msgWhatsapp,
      }, { headers });
      alert('Configuración guardada');
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  function handleToggle(field) {
    setConfig(c => ({ ...c, [field]: !c[field] }));
  }

  async function enviarPrueba() {
    try {
      await axios.post('http://localhost:3001/api/profesional/recordatorios/prueba', {}, { headers });
      alert('Recordatorio de prueba enviado');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Configuración de Recordatorios</h1>
        <p className="text-gray-500">Configura cuándo y cómo se envían recordatorios a los pacientes.</p>
      </header>

      <div className="grid gap-6">
        
        {/* SECCIÓN: CANALES */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Bell style={{ color: brand.DEFAULT }} size={20} />
            <h2 className="text-lg font-semibold">Canales de notificación</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 font-medium">
                <Mail className="text-gray-400" size={18} />
                <span>Email (Siempre activo)</span>
              </div>
              <div 
                className="w-10 h-5 rounded-full relative cursor-not-allowed"
                style={{ backgroundColor: brand.DEFAULT }}
              >
                <div className="absolute right-1 top-1 bg-white w-3 h-3 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 font-medium">
                <MessageCircle className="text-gray-400" size={18} />
                <span>WhatsApp Business</span>
              </div>
              <button 
                onClick={() => handleToggle('whatsappActive')}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: config.whatsappActive ? brand.DEFAULT : '#D1D5DB' }}
              >
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${config.whatsappActive ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            {config.whatsappActive && (
              <input 
                type="text" 
                placeholder="Número de WhatsApp Business (ej: +549...)"
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 outline-none"
                style={{ borderColor: brand.DEFAULT }}
                value={config.whatsappNumber}
                onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
              />
            )}
          </div>
        </section>

        {/* SECCIÓN: CUÁNDO ENVIAR */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Cuándo enviar recordatorios</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <input 
                  type="checkbox" 
                  checked={config[`r${num}`]} 
                  onChange={() => handleToggle(`r${num}`)}
                  className="w-5 h-5"
                  style={{ accentColor: brand.DEFAULT }}
                />
                <span className="text-sm font-bold w-32 text-gray-600">Recordatorio {num}:</span>
                <select 
                  disabled={!config[`r${num}`]}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded text-sm disabled:opacity-50 outline-none focus:ring-1"
                  style={{ focusRingColor: brand.DEFAULT }}
                  value={config[`r${num}Time`]}
                  onChange={(e) => setConfig(c => ({...c, [`r${num}Time`]: parseInt(e.target.value)}))}
                >
                  <option value={72}>72 horas antes</option>
                  <option value={48}>48 horas antes</option>
                  <option value={24}>24 horas antes</option>
                  <option value={3}>3 horas antes</option>
                  <option value={1}>1 hora antes</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN: CONTENIDO */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Contenido del recordatorio</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Preview</label>
              <textarea 
                className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 outline-none"
                style={{ focusRingColor: brand.DEFAULT }}
                value={config.msgEmail}
                onChange={(e) => setConfig({...config, msgEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp Preview</label>
              <textarea 
                className="w-full h-32 p-3 text-sm border border-emerald-100 rounded-lg bg-emerald-50 focus:ring-2 outline-none"
                style={{ focusRingColor: brand.DEFAULT }}
                value={config.msgWhatsapp}
                onChange={(e) => setConfig({...config, msgWhatsapp: e.target.value})}
              />
            </div>
          </div>
          <button 
            className="mt-4 flex items-center gap-2 font-bold text-sm hover:opacity-80 transition-opacity"
            style={{ color: brand.DEFAULT }}
            onClick={enviarPrueba}
          >
            <Send size={16} /> Enviar recordatorio de prueba
          </button>
        </section>

        {/* SECCIÓN: CONFIRMACIÓN Y AUSENCIA */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold">Confirmación automática</h2>
              <p className="text-xs text-gray-500 max-w-md">
                {config.confirmacionAuto 
                  ? "Los turnos se confirman inmediatamente al reservar." 
                  : "Los turnos quedan pendientes hasta que el profesional los confirme manualmente."}
              </p>
            </div>
            <button 
                onClick={() => handleToggle('confirmacionAuto')}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: config.confirmacionAuto ? brand.DEFAULT : '#D1D5DB' }}
              >
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${config.confirmacionAuto ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-gray-400" />
              <h2 className="text-lg font-semibold">Recordatorio de ausencia</h2>
            </div>
            <button 
                onClick={() => handleToggle('notifAusencia')}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: config.notifAusencia ? brand.DEFAULT : '#D1D5DB' }}
              >
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${config.notifAusencia ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {config.notifAusencia && (
            <input 
              type="text" 
              placeholder="Mensaje de ausencia personalizable..."
              className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:ring-2 outline-none"
              style={{ borderColor: brand.DEFAULT }}
            />
          )}
        </section>

        {/* FOOTER */}
        <footer className="flex justify-end pt-4">
          <button 
            className="flex items-center gap-2 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: brand.DEFAULT }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = brand.dark}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = brand.DEFAULT}
            onClick={guardar}
            disabled={guardando || cargando}
          >
            <Save size={20} /> {guardando ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfiguracionRecordatorios;