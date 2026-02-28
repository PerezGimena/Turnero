import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Download, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  MoreVertical,
  ChevronRight,
  X
} from 'lucide-react';

const PagosRecibidos = () => {
  const brand = { DEFAULT: '#10B981', dark: '#059669', light: '#ECFDF5' };
  
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [selectedPago, setSelectedPago] = useState(null); // Para el Drawer

  const pagos = [
    { id: 'TR-9821', fecha: '28/02/2026', paciente: 'Laura González', monto: 5000, moneda: 'ARS', pasarela: 'MercadoPago', estado: 'Aprobado', turno: '28 Feb - 10:30' },
    { id: 'TR-9819', fecha: '27/02/2026', paciente: 'Marcos Peña', monto: 5000, moneda: 'ARS', pasarela: 'Stripe', estado: 'Pendiente', turno: '02 Mar - 16:00' },
    { id: 'TR-9780', fecha: '25/02/2026', paciente: 'Ana Luz', monto: 4500, moneda: 'ARS', pasarela: 'MercadoPago', estado: 'Reembolsado', turno: '24 Feb - 09:00' },
  ];

  const getStatusBadge = (estado) => {
    const styles = {
      'Aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
      'Reembolsado': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${styles[estado]}`}>{estado.toUpperCase()}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans text-gray-800 relative">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pagos recibidos</h1>
          <p className="text-gray-500 text-sm">Seguimiento de ingresos y transacciones de tus turnos.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
          <Download size={16} /> Exportar CSV
        </button>
      </header>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Este mes</p>
          <p className="text-2xl font-black" style={{ color: brand.DEFAULT }}>$47.500 ARS</p>
          <p className="text-xs text-gray-500 mt-1">19 pagos recibidos</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pendiente</p>
          <p className="text-2xl font-black text-amber-500">$6.000 ARS</p>
          <p className="text-xs text-gray-500 mt-1">3 turnos por confirmar pago</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-b-4" style={{ borderBottomColor: brand.DEFAULT }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total acumulado</p>
          <p className="text-2xl font-black text-gray-800">$284.000 ARS</p>
          <p className="text-xs text-gray-500 mt-1">Desde el inicio</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['Todos', 'Aprobado', 'Pendiente', 'Reembolsado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroEstado === estado ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              style={{ backgroundColor: filtroEstado === estado ? brand.DEFAULT : '' }}
            >
              {estado}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Calendar size={14} className="text-gray-400" />
          <input type="text" placeholder="Rango de fechas" className="bg-transparent text-xs outline-none w-40" />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-t-0 border-gray-100 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-widest">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4 text-right">Monto</th>
              <th className="px-6 py-4">Pasarela</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Turno</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pagos.map((pago) => (
              <tr 
                key={pago.id} 
                onClick={() => setSelectedPago(pago)}
                className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4 text-gray-500">{pago.fecha}</td>
                <td className="px-6 py-4 font-bold">{pago.paciente}</td>
                <td className="px-6 py-4 text-right font-black">${pago.monto}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${pago.pasarela === 'Stripe' ? 'bg-[#635BFF]' : 'bg-[#009EE3]'}`}></div>
                    {pago.pasarela}
                  </span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(pago.estado)}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">{pago.turno}</td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRAWER DETALLE DE PAGO */}
      {selectedPago && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedPago(null)}></div>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold">Detalle de transacción</h3>
              <button onClick={() => setSelectedPago(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: brand.light }}>
                <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Monto Cobrado</p>
                <p className="text-4xl font-black" style={{ color: brand.dark }}>${selectedPago.monto} {selectedPago.moneda}</p>
                <div className="mt-3 flex justify-center">{getStatusBadge(selectedPago.estado)}</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 text-sm">ID Transacción</span>
                  <span className="font-mono text-sm">{selectedPago.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 text-sm">Paciente</span>
                  <span className="font-bold">{selectedPago.paciente}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 text-sm">Pasarela</span>
                  <span className="font-medium">{selectedPago.pasarela}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 text-sm">Fecha y Hora</span>
                  <span className="font-medium">{selectedPago.fecha} - 14:22hs</span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-800">
                  El reembolso total está disponible según tu política de "más de 24hs de antelación". 
                  Esta acción es irreversible.
                </p>
              </div>

              {selectedPago.estado === 'Aprobado' && (
                <button className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center justify-center gap-2">
                  <RotateCcw size={18} /> Reembolsar Dinero
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PagosRecibidos;