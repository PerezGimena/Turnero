import React, { useState } from 'react';
import { DollarSign, Check, Link, ShieldCheck, CreditCard, Save, AlertCircle } from 'lucide-react';

const ConfigPagosProfesional = () => {
  // Identidad visual
  const brand = { DEFAULT: '#10B981', dark: '#059669', light: '#ECFDF5' };

  // Estados
  const [pagoObligatorio, setPagoObligatorio] = useState(true);
  const [monto, setMonto] = useState('4500');
  const [moneda, setMoneda] = useState('ARS');
  const [pasarela, setPasarela] = useState('mercadopago'); // 'mercadopago' | 'stripe'
  const [statusConexion, setStatusConexion] = useState('DESCONECTADO');
  const [reembolsoActivo, setReembolsoActivo] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Configuración de pagos</h1>
        <p className="text-gray-500">Configuración de si se requiere pago y qué pasarela usar.</p>
      </header>

      <div className="space-y-6">
        
        {/* SECCIÓN: ¿REQUERIR PAGO? */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-gray-700">¿Requerir pago para reservar?</h2>
            <button 
              onClick={() => setPagoObligatorio(!pagoObligatorio)}
              className="w-14 h-7 rounded-full transition-colors relative"
              style={{ backgroundColor: pagoObligatorio ? brand.DEFAULT : '#D1D5DB' }}
            >
              <div className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-all ${pagoObligatorio ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          {pagoObligatorio && (
            <div className="flex flex-col gap-2 p-4 rounded-lg border animate-in slide-in-from-top-2" style={{ backgroundColor: brand.light, borderColor: brand.DEFAULT + '33' }}>
              <label className="text-xs font-bold uppercase" style={{ color: brand.dark }}>Monto del turno</label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="flex-1 p-2 border border-gray-200 rounded-md focus:ring-2 outline-none"
                  style={{ focusRingColor: brand.DEFAULT }}
                />
                <select 
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-32 p-2 border border-gray-200 rounded-md bg-white font-medium outline-none"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* SECCIÓN: PASARELA DE PAGOS */}
        <section className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity ${!pagoObligatorio && 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-lg font-semibold mb-6">Pasarela de pagos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Card MercadoPago */}
            <div 
              onClick={() => setPasarela('mercadopago')}
              className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all ${pasarela === 'mercadopago' ? 'shadow-md' : 'hover:bg-gray-50 border-gray-100'}`}
              style={{ borderColor: pasarela === 'mercadopago' ? brand.DEFAULT : '' }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-[#009EE3] text-xl italic">MercadoPago</span>
                {pasarela === 'mercadopago' && (
                   <div className="bg-emerald-100 p-1 rounded-full">
                     <Check size={16} style={{ color: brand.DEFAULT }} />
                   </div>
                )}
              </div>
              <p className="text-xs font-semibold" style={{ color: pasarela === 'mercadopago' ? brand.DEFAULT : '#9CA3AF' }}>
                {pasarela === 'mercadopago' ? 'Seleccionado ✓' : 'Seleccionar'}
              </p>
            </div>

            {/* Card Stripe */}
            <div 
              onClick={() => setPasarela('stripe')}
              className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all ${pasarela === 'stripe' ? 'shadow-md' : 'hover:bg-gray-50 border-gray-100'}`}
              style={{ borderColor: pasarela === 'stripe' ? brand.DEFAULT : '' }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-[#635BFF] text-xl">Stripe</span>
                {pasarela === 'stripe' && (
                   <div className="bg-emerald-100 p-1 rounded-full">
                     <Check size={16} style={{ color: brand.DEFAULT }} />
                   </div>
                )}
              </div>
              <p className="text-xs font-semibold" style={{ color: pasarela === 'stripe' ? brand.DEFAULT : '#9CA3AF' }}>
                {pasarela === 'stripe' ? 'Seleccionado ✓' : 'Conectar'}
              </p>
            </div>
          </div>

          {/* Formulario condicional de pasarela */}
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                Configuración de {pasarela === 'mercadopago' ? 'MercadoPago' : 'Stripe'}
              </h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${statusConexion === 'CONECTADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {statusConexion}
              </span>
            </div>

            <div className="space-y-4">
              {pasarela === 'mercadopago' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Access Token</label>
                  <div className="flex gap-2">
                    <input type="password" placeholder="APP_USR-..." className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 outline-none" style={{ focusRingColor: brand.DEFAULT }} />
                    <button className="px-4 py-2 rounded font-bold text-sm text-white transition-colors" style={{ backgroundColor: brand.DEFAULT }}>
                      Validar credenciales
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Publishable Key</label>
                    <input type="text" placeholder="pk_live_..." className="w-full p-2 border border-gray-300 rounded focus:ring-1 outline-none" style={{ focusRingColor: brand.DEFAULT }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secret Key</label>
                    <div className="flex gap-2">
                      <input type="password" placeholder="sk_live_..." className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 outline-none" style={{ focusRingColor: brand.DEFAULT }} />
                      <button className="px-4 py-2 rounded font-bold text-sm text-white" style={{ backgroundColor: brand.DEFAULT }}>
                        Validar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECCIÓN: POLÍTICA DE REEMBOLSOS */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck size={20} style={{ color: brand.DEFAULT }} />
              Política de reembolsos
            </h2>
            <button 
              onClick={() => setReembolsoActivo(!reembolsoActivo)}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ backgroundColor: reembolsoActivo ? brand.DEFAULT : '#D1D5DB' }}
            >
              <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${reembolsoActivo ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4 italic">Este texto se muestra al paciente en el formulario de reserva.</p>
          <select disabled={!reembolsoActivo} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium focus:ring-1 outline-none disabled:opacity-50">
            <option>Con más de 24hs → reembolso total | Con menos de 24hs → sin reembolso</option>
            <option>Con más de 48hs → reembolso total | Menos de 48hs → sin reembolso</option>
            <option>Sin reembolsos permitidos</option>
          </select>
        </section>

        {/* SECCIÓN: RESUMEN */}
        <section className="p-6 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <h2 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-4 text-center">Resumen de Pagos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Tus turnos cuestan</p>
              <p className="text-xl font-black" style={{ color: brand.DEFAULT }}>{pagoObligatorio ? `$${monto} ${moneda}` : 'Sin costo'}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">Pasarela</p>
              <p className="text-xl font-black capitalize">{pasarela} {statusConexion === 'CONECTADO' ? '✓' : ''}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Reembolsos</p>
              <p className="text-xl font-black" style={{ color: reembolsoActivo ? brand.dark : '#9CA3AF' }}>
                {reembolsoActivo ? 'Activados' : 'Desactivados'}
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex justify-end pt-4 pb-10">
          <button 
            className="flex items-center gap-2 text-white px-12 py-4 rounded-xl font-black shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: brand.DEFAULT }}
          >
            <Save size={20} /> Guardar configuración
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfigPagosProfesional;