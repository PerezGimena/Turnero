import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

// ── Helpers ──────────────────────────────────────────────────────────────────
const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const DIAS_KEYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]; // Map JS getDay() 0-6 to DB keys
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function CalendarioReservaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Estado del calendario (vista actual)
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Estados de carga y datos
  const [profesional, setProfesional] = useState(null);
  const [loadingProfesional, setLoadingProfesional] = useState(true);
  
  // Selección
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorPropio, setErrorPropio] = useState(null);

  // 1. Cargar Perfil del Profesional
  useEffect(() => {
    const fetchProfesional = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/publico/${slug}`);
        if (data.ok) {
          setProfesional(data.data);
        }
      } catch (err) {
        console.error("Error fetching profesional:", err);
        setErrorPropio("No se pudo cargar la información del profesional.");
      } finally {
        setLoadingProfesional(false);
      }
    };
    if (slug) fetchProfesional();
  }, [slug]);

  // 2. Cargar Horarios (Slots) cuando se elige fecha
  useEffect(() => {
    if (!fechaSeleccionada) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      // Reseteamos selección de horario al cambiar fecha
      setHorarioSeleccionado(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/publico/${slug}/horarios`, {
          params: { fecha: fechaSeleccionada }
        });
        
        if (response.data.ok) {
          // data.data debe ser [{ hora: "09:00", disponible: true }, ...]
          setSlots(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [fechaSeleccionada, slug]);

  const cells = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  // Funciones de navegación calendario
  function prevMes() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setFechaSeleccionada(null);
  }

  function nextMes() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setFechaSeleccionada(null);
  }

  function seleccionarFecha(day) {
    if (!day) return;
    const key = toKey(viewYear, viewMonth, day);
    
    // Bloquear días pasados
    if (key < todayKey) return;
    
    setFechaSeleccionada(key);
  }

  function confirmar() {
    if (!fechaSeleccionada || !horarioSeleccionado) return;
    navigate(`/${slug}/reservar/formulario?fecha=${fechaSeleccionada}&hora=${horarioSeleccionado}`);
  }

  // Skeletons simulados
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
  
  // Label fecha para mostrar
  const fechaLabel = fechaSeleccionada
    ? new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;

  if (loadingProfesional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
           <p className="text-gray-500 font-medium">Cargando agenda del profesional...</p>
         </div>
      </div>
    );
  }

  if (errorPropio || !profesional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{errorPropio || "No se encontró el profesional."}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 font-medium hover:underline">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Resumen Profesional */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xl uppercase overflow-hidden">
               {profesional.avatar ? (
                 <img src={profesional.avatar} alt={profesional.nombre} className="w-full h-full object-cover" />
               ) : (
                 `${profesional.nombre.charAt(0)}${profesional.apellido.charAt(0)}`
               )}
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Profesional</p>
              <h2 className="font-bold text-gray-900 leading-tight">{profesional.nombre} {profesional.apellido}</h2>
              <p className="text-sm text-gray-500 mt-1">{profesional.especialidad}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Duración del turno</p>
                <p className="text-xs text-gray-500">{profesional.duracionTurno} min aprox.</p>
              </div>
            </div>
            {/* Precio si estuviere disponible */}
            {profesional.precioConsulta && (
               <div className="flex items-start gap-3">
                 <div className="w-5 h-5 flex items-center justify-center text-gray-400 mt-0.5 font-sans">$</div>
                 <div>
                   <p className="text-sm font-medium text-gray-900">Consulta</p>
                   <p className="text-xs text-gray-500">${profesional.precioConsulta}</p>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Panel Central: Calendario y Horarios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Calendario */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 capitalize">
                {MESES[viewMonth]} {viewYear}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMes} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextMes} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="" />;
                
                const key = toKey(viewYear, viewMonth, day);
                const isPast = key < todayKey;
                const isSelected = fechaSeleccionada === key;

                // Calculamos si el día de la semana está habilitado para el profesional
                const currentDayDate = new Date(viewYear, viewMonth, day);
                const dayIndex = currentDayDate.getDay(); // 0-6
                const dayKey = DIAS_KEYS[dayIndex];
                
                // diasConfiguracion es array de objs { dia: "lunes", ... }
                const isConfigurado = profesional.diasConfiguracion?.some(d => d.dia === dayKey);

                // Si es pasado, bloqueado.
                // Si NO está configurado, bloqueado (disabled).
                const isSelectable = !isPast && isConfigurado; 

                return (
                  <button
                    key={i}
                    disabled={!isSelectable}
                    onClick={() => seleccionarFecha(day)}
                    className={`
                      h-10 w-full rounded-lg text-sm font-medium flex items-center justify-center transition-all relative
                      ${isSelected 
                        ? "bg-blue-600 text-white shadow-md scale-105" 
                        : isSelectable 
                          ? "hover:bg-blue-50 text-gray-700 hover:text-blue-600" 
                          : "text-gray-300 cursor-not-allowed"}
                    `}
                  >
                    {day}
                    {/* Indicador visual de día con "potencial" disponibilidad */}
                    {isConfigurado && !isPast && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400 opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horarios */}
          {fechaSeleccionada && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                <span className="capitalize">{fechaLabel}</span>
              </h3>
              
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                   {[...Array(8)].map((_, i) => (
                     <Skeleton key={i} className="h-10 w-full" />
                   ))}
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map((slot, idx) => {
                    // slot: { hora: "09:00", disponible: true/false }
                    const horaStr = typeof slot === 'string' ? slot : slot.hora; 
                    const isDisponible = typeof slot === 'string' ? true : slot.disponible;
                    
                    const isSelected = horarioSeleccionado === horaStr;
                    
                    return (
                      <button
                        key={idx}
                        disabled={!isDisponible}
                        onClick={() => setHorarioSeleccionado(horaStr)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium border transition-all
                          ${!isDisponible 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice" 
                            : isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                          }
                        `}
                      >
                        {horaStr}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No hay horarios disponibles para este día.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Footer Fijo / Botón Flotante */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
            {horarioSeleccionado && (
              <p className="text-sm text-gray-600">
                Seleccionado: <span className="font-bold text-gray-900">{fechaLabel} a las {horarioSeleccionado} hs</span>
              </p>
            )}
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={!fechaSeleccionada || !horarioSeleccionado}
              className={`
                flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                ${fechaSeleccionada && horarioSeleccionado 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg translate-y-0" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"}
              `}
            >
              Confirmar horario
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}