import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, CheckCircle, XCircle, ExternalLink, Save,
  Signal, Wifi, Battery, Star, Shield, Clock, MapPin,
  Building2, Video, BadgeCheck, ChevronRight,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

const PerfilPublico = () => {
  const { token, logout } = useAuthStore();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(null);

  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    especialidadOtra: '',
    matricula: '',
    descripcion: '',
    modalidad: 'Presencial',
    direccion: '',
    aceptaObrasSociales: false,
    obrasSociales: [],
    telefono: '',
    precioConsulta: '',
    duracionTurno: 30,
    slug: '',
    fotoPerfil: null,
    confirmacionAutomatica: false,
    dias: {
      lunes:     { activo: true,  inicio: "09:00", fin: "17:00" },
      martes:    { activo: true,  inicio: "09:00", fin: "17:00" },
      miercoles: { activo: true,  inicio: "09:00", fin: "17:00" },
      jueves:    { activo: true,  inicio: "09:00", fin: "17:00" },
      viernes:   { activo: true,  inicio: "09:00", fin: "17:00" },
      sabado:    { activo: false, inicio: "09:00", fin: "13:00" },
      domingo:   { activo: false, inicio: "09:00", fin: "13:00" },
    }
  });

  const [slugDisponible, setSlugDisponible] = useState(true);
  const [obrasSocialesInput, setObrasSocialesInput] = useState("");

  const OBRAS_COMUNES = ["OSDE", "Swiss Medical", "Galeno", "PAMI", "Medifé", "IOMA", "Accord Salud", "Sancor Salud"];

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/profesional/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const diasBackend = data.data.diasConfiguracion || [];
        const diasTransformado = {};
        
        if (diasBackend.length > 0) {
          diasBackend.forEach(d => {
            diasTransformado[d.dia] = {
              activo: d.habilitado,
              inicio: d.horaInicio,
              fin: d.horaFin
            };
          });
        }

        const d = data.data;
        setPerfil(prev => ({
          ...prev,
          ...d,
          descripcion:            d.descripcion            ?? '',
          matricula:              d.matricula              ?? '',
          direccion:              d.direccion              ?? '',
          telefono:               d.telefono               ?? '',
          precioConsulta:         d.precioConsulta         ?? '',
          slug:                   d.slug                   ?? '',
          obrasSociales:          Array.isArray(d.obrasSociales) ? d.obrasSociales : [],
          aceptaObrasSociales:    d.aceptaObrasSociales    ?? false,
          duracionTurno:          d.duracionTurno          ?? 30,
          modalidad:              d.modalidad              ?? 'Presencial',
          fotoPerfil:             d.fotoPerfil             ?? null,
          confirmacionAutomatica: d.confirmacionAutomatica ?? false,
          dias: { ...prev.dias, ...diasTransformado }
        }));
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPerfil();
  }, [token, logout]);

  const handleSave = async () => {
    setSaving(true);
    setMensajeGuardado(null);
    try {
      const { dias, ...restoPerfil } = perfil;
      
      const diasConfiguracion = Object.keys(dias).map(diaKey => ({
        dia: diaKey,
        habilitado: dias[diaKey].activo,
        horaInicio: dias[diaKey].inicio,
        horaFin: dias[diaKey].fin
      }));

      const payload = { ...restoPerfil, diasConfiguracion };

      await axios.put(`${import.meta.env.VITE_API_URL}/profesional/perfil`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajeGuardado('ok');
      setTimeout(() => setMensajeGuardado(null), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensajeGuardado('error');
      setTimeout(() => setMensajeGuardado(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleObraSocial = (os) => {
    setPerfil(prev => ({
      ...prev,
      obrasSociales: prev.obrasSociales.includes(os)
        ? prev.obrasSociales.filter(o => o !== os)
        : [...prev.obrasSociales, os]
    }));
  };

  const agregarObraPersonalizada = () => {
    const val = obrasSocialesInput.trim();
    if (val && !perfil.obrasSociales.includes(val)) {
      setPerfil(prev => ({ ...prev, obrasSociales: [...prev.obrasSociales, val] }));
    }
    setObrasSocialesInput("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPerfil(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Imagen inválida.'); return; }
      if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setPerfil(prev => ({ ...prev, fotoPerfil: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();

  const especialidadDisplay = perfil.especialidad === 'otra' ? perfil.especialidadOtra : perfil.especialidad;
  const initials = [perfil.nombre, perfil.apellido].filter(Boolean).map(s => s[0].toUpperCase()).join('') || '?';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Cargando perfil...
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex flex-1 overflow-hidden">

        {/* COLUMNA IZQUIERDA: EDITOR */}
        <section className="w-1/2 p-8 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Editar Perfil Público</h1>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          {mensajeGuardado === 'ok' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Perfil actualizado correctamente
            </div>
          )}
          {mensajeGuardado === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <XCircle size={16} /> Error al guardar los cambios. Intentá de nuevo.
            </div>
          )}

          {/* IDENTIDAD */}
          <div className="space-y-5 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Identidad</h2>

            <div className="flex items-center gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFotoChange} accept="image/*" className="hidden" />
              <div onClick={triggerFileSelect}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 overflow-hidden relative shrink-0">
                {perfil.fotoPerfil
                  ? <img src={perfil.fotoPerfil} alt="Preview" className="w-full h-full object-cover" />
                  : <><Camera size={24} /><span className="text-[10px] mt-1">Upload</span></>}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input type="text" name="nombre" placeholder="Nombre" value={perfil.nombre} onChange={handleChange}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                <input type="text" name="apellido" placeholder="Apellido" value={perfil.apellido} onChange={handleChange}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="space-y-3">
              <select name="especialidad" value={perfil.especialidad} onChange={handleChange}
                className="w-full p-2 border rounded-md outline-none">
                <option value="">Seleccionar Especialidad</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Psicología">Psicología</option>
                <option value="Nutrición">Nutrición</option>
                <option value="otra">Otra...</option>
              </select>
              {perfil.especialidad === 'otra' && (
                <input type="text" name="especialidadOtra" placeholder="Escribe tu especialidad"
                  value={perfil.especialidadOtra} onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
              )}
            </div>

            <input type="text" name="matricula" placeholder="Matrícula (ej: MN 12345)"
              value={perfil.matricula} onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />

            <div>
              <textarea name="descripcion" maxLength="280"
                placeholder="Cuéntale a tus pacientes sobre tu experiencia..."
                value={perfil.descripcion} onChange={handleChange}
                className="w-full p-2 border rounded-md h-24 resize-none outline-none" />
              <p className="text-right text-xs text-gray-400">{perfil.descripcion.length}/280 caracteres</p>
            </div>
          </div>

          {/* CONTACTO Y MODALIDAD */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Contacto y Modalidad</h2>
            <div className="flex gap-4 flex-wrap">
              {['Presencial', 'Virtual', 'Presencial y Virtual'].map(mod => (
                <label key={mod} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="modalidad" value={mod} checked={perfil.modalidad === mod} onChange={handleChange} />
                  <span className="text-sm">{mod}</span>
                </label>
              ))}
            </div>
            {(perfil.modalidad === 'Presencial' || perfil.modalidad === 'Presencial y Virtual') && (
              <input type="text" name="direccion" placeholder="Dirección del consultorio"
                value={perfil.direccion} onChange={handleChange}
                className="w-full p-2 border rounded-md outline-none" />
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="aceptaObrasSociales" checked={perfil.aceptaObrasSociales} onChange={handleChange} id="os" />
                <label htmlFor="os" className="text-sm font-medium text-gray-700">Acepta Obras Sociales</label>
              </div>

              {perfil.aceptaObrasSociales && (
                <div className="space-y-3 pl-1">
                  <p className="text-xs text-gray-500">Seleccioná las que aceptás:</p>
                  <div className="flex flex-wrap gap-2">
                    {OBRAS_COMUNES.map(os => {
                      const activa = perfil.obrasSociales.includes(os);
                      return (
                        <button key={os} type="button" onClick={() => toggleObraSocial(os)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            activa
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                          }`}>
                          {activa ? '✓ ' : ''}{os}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input type="text" placeholder="Otra obra social..."
                      value={obrasSocialesInput}
                      onChange={e => setObrasSocialesInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && agregarObraPersonalizada()}
                      className="flex-1 p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <button type="button" onClick={agregarObraPersonalizada}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      + Agregar
                    </button>
                  </div>

                  {perfil.obrasSociales.filter(o => !OBRAS_COMUNES.includes(o)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {perfil.obrasSociales.filter(o => !OBRAS_COMUNES.includes(o)).map(os => (
                        <span key={os} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                          {os}
                          <button type="button" onClick={() => toggleObraSocial(os)}
                            className="text-blue-400 hover:text-blue-700 font-bold ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {perfil.obrasSociales.length > 0 && (
                    <p className="text-xs text-gray-400">{perfil.obrasSociales.length} cobertura{perfil.obrasSociales.length !== 1 ? 's' : ''} seleccionada{perfil.obrasSociales.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Confirmación automática ── */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Confirmación automática</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {perfil.confirmacionAutomatica
                    ? "Los turnos se confirman solos al reservar."
                    : "Tenés que aprobar cada turno manualmente."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPerfil(prev => ({ ...prev, confirmacionAutomatica: !prev.confirmacionAutomatica }))}
              >
                {perfil.confirmacionAutomatica
                  ? <ToggleRight size={28} className="text-emerald-500" />
                  : <ToggleLeft size={28} className="text-slate-300" />
                }
              </button>
            </div>
          </div>

          {/* HORARIOS */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Horarios de Atención</h2>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Duración del turno</p>
              <div className="flex gap-2 flex-wrap">
                {[15, 20, 30, 45, 60].map(d => (
                  <button key={d} 
                    onClick={() => setPerfil(prev => ({ ...prev, duracionTurno: d }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                      ${parseInt(perfil.duracionTurno) === d ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {DIAS_SEMANA.map(dia => {
                const d = perfil.dias?.[dia] || { activo: false, inicio: "09:00", fin: "17:00" };
                return (
                  <div key={dia} className={`rounded-xl border p-3 transition-all ${d.activo ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 capitalize">{dia}</span>
                      <button onClick={() => setPerfil(prev => ({
                        ...prev, dias: { ...prev.dias, [dia]: { ...d, activo: !d.activo } }
                      }))}>
                        {d.activo
                          ? <ToggleRight size={22} className="text-emerald-500" />
                          : <ToggleLeft size={22} className="text-slate-300" />
                        }
                      </button>
                    </div>
                    {d.activo && (
                      <div className="flex items-center gap-2">
                        <input type="time" value={d.inicio}
                          onChange={e => setPerfil(prev => ({ ...prev, dias: { ...prev.dias, [dia]: { ...d, inicio: e.target.value } } }))}
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400" />
                        <span className="text-xs text-slate-400">—</span>
                        <input type="time" value={d.fin}
                          onChange={e => setPerfil(prev => ({ ...prev, dias: { ...prev.dias, [dia]: { ...d, fin: e.target.value } } }))}
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* URL PÚBLICA */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">URL Pública</h2>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 select-none text-sm">turnosalud.com/</span>
              <input type="text" name="slug" value={perfil.slug} onChange={handleChange}
                className="w-full p-2 pl-[130px] pr-10 border rounded-md outline-none font-mono text-sm" />
              <div className="absolute right-3 top-2.5">
                {slugDisponible ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
              </div>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: PREVIEW */}
        <section className="w-1/2 bg-gradient-to-br from-slate-200 to-gray-300 p-10 flex justify-center items-start pt-12 overflow-y-auto">
          <div className="relative" style={{ filter: 'drop-shadow(0 28px 50px rgba(0,0,0,0.32))' }}>

            <div className="absolute -left-[5px] top-[96px]  w-[5px] h-7 bg-gray-600 rounded-l-md" />
            <div className="absolute -left-[5px] top-[134px] w-[5px] h-7 bg-gray-600 rounded-l-md" />
            <div className="absolute -right-[5px] top-[116px] w-[5px] h-10 bg-gray-600 rounded-r-md" />

            <div className="relative bg-gray-900 overflow-hidden"
              style={{ width: 290, height: 600, borderRadius: 46, border: '2px solid #3a3a3a' }}>

              <div className="absolute inset-0 pointer-events-none z-30 rounded-[46px]"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)' }} />

              <div className="absolute bg-white flex flex-col overflow-hidden"
                style={{ top: 6, left: 6, right: 6, bottom: 6, borderRadius: 40 }}>

                <div className="relative flex items-center justify-between px-4 pt-2 pb-1 bg-white shrink-0 z-10">
                  <span className="text-[9px] font-bold text-gray-800">9:41</span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-16 h-4 bg-black rounded-full flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800 border border-gray-600" />
                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Signal size={9} className="text-gray-800" />
                    <Wifi size={9} className="text-gray-800" />
                    <Battery size={9} className="text-gray-800" />
                  </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-white/90 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">TS</span>
                    </div>
                    <span className="text-[8px] font-semibold text-gray-800">TurnoSalud</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-blue-600 text-white text-[7px] font-medium px-1.5 py-0.5 rounded-md">
                    Reservar <ChevronRight size={7} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto phone-scroll bg-gray-50">
                  <div className="bg-white mx-2 mt-2 rounded-xl border border-gray-100 p-3 shadow-sm flex gap-2.5 items-start">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-base border-2 border-white shadow overflow-hidden">
                        {perfil.fotoPerfil
                          ? <img src={perfil.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                          : <span>{initials}</span>}
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[7px] font-bold tracking-widest text-blue-600 uppercase">
                        {especialidadDisplay || 'Especialidad'}
                      </p>
                      <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">
                        {[perfil.nombre, perfil.apellido].filter(Boolean).join(' ') || 'Nombre Apellido'}
                      </p>
                      {perfil.matricula && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <BadgeCheck size={8} className="text-blue-500 shrink-0" />
                          <span className="text-[7px] text-gray-500 font-medium">Mat. {perfil.matricula}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5 mt-0.5 mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={7} className="fill-amber-400 text-amber-400" />)}
                        <span className="text-[7px] text-gray-400 ml-0.5">4.9 · 128 reseñas</span>
                      </div>
                      <p className="text-[7.5px] text-gray-400 leading-relaxed line-clamp-2">
                        {perfil.descripcion || 'Aquí aparecerá tu descripción profesional...'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mx-2 mt-1.5">
                    <div className="bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
                      <div className="flex items-center gap-0.5 mb-1">
                        <Building2 size={9} className="text-blue-500" />
                        {perfil.modalidad !== 'Presencial' && <Video size={9} className="text-blue-500" />}
                      </div>
                      <p className="text-[6px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Modalidad</p>
                      <p className="text-[7px] font-semibold text-gray-800 leading-tight">{perfil.modalidad}</p>
                      {perfil.direccion && (
                        <p className="text-[6px] text-gray-400 mt-0.5 flex items-center gap-0.5 leading-tight">
                          <MapPin size={6} /><span className="truncate">{perfil.direccion}</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
                      <Clock size={9} className="text-blue-500 mb-1" />
                      <p className="text-[6px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Duración</p>
                      <p className="text-[7.5px] font-semibold text-gray-800">{perfil.duracionTurno} min</p>
                      <p className="text-[6px] text-gray-400 mt-0.5">Por consulta</p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
                      <Shield size={9} className="text-blue-500 mb-1" />
                      <p className="text-[6px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Coberturas</p>
                      {perfil.aceptaObrasSociales && perfil.obrasSociales.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {perfil.obrasSociales.slice(0, 2).map(os => (
                            <span key={os} className="text-[5.5px] bg-blue-50 text-blue-600 font-medium px-1 py-0.5 rounded-full leading-tight">{os}</span>
                          ))}
                          {perfil.obrasSociales.length > 2 && (
                            <span className="text-[5.5px] text-gray-400 font-medium px-0.5 py-0.5">+{perfil.obrasSociales.length - 2}</span>
                          )}
                        </div>
                      ) : perfil.aceptaObrasSociales ? (
                        <span className="text-[6px] bg-blue-50 text-blue-600 font-medium px-1 py-0.5 rounded-full">Acepta OS</span>
                      ) : (
                        <span className="text-[6.5px] text-gray-400">Particular</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white mx-2 mt-1.5 rounded-xl border border-gray-100 p-2.5 shadow-sm">
                    <p className="text-[8px] font-bold text-gray-900 mb-0.5">Días disponibles</p>
                    <p className="text-[6.5px] text-gray-400 mb-2">Seleccioná un día para ver los horarios.</p>
                    <div className="flex flex-wrap gap-1">
                      {DIAS_SEMANA.filter(d => perfil.dias?.[d]?.activo).map((dia, i) => (
                        <span key={dia}
                          className={`px-1.5 py-0.5 rounded text-[6.5px] font-medium border ${i === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                          {dia.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mx-2 mt-1.5 mb-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-3 text-center shadow">
                    <p className="text-[9px] font-bold text-white mb-0.5">¿Listo para reservar?</p>
                    <p className="text-[6.5px] text-blue-100 mb-2">Confirmá tu turno en menos de 2 minutos.</p>
                    <div className="inline-flex items-center gap-1 bg-white text-blue-600 font-semibold px-3 py-1 rounded-lg text-[7px]">
                      Ver turnos disponibles
                    </div>
                  </div>

                  <div className="pb-3 text-center">
                    <p className="text-[6px] text-gray-400">
                      Powered by <span className="font-semibold text-blue-600">TurnoSalud</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-white/30 rounded-full z-20" />
            </div>
          </div>
        </section>
      </main>

      <footer className="h-20 bg-white border-t border-gray-200 px-8 flex items-center justify-between shadow-inner">
        <button className="flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm">
          Ver mi página pública <ExternalLink size={16} />
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
          <Save size={18} /> {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .phone-scroll::-webkit-scrollbar { width: 0; background: transparent; }
        .phone-scroll { scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PerfilPublico;