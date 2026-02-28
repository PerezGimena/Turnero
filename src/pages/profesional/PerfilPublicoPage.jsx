import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, XCircle, ExternalLink, Save } from 'lucide-react';

const PerfilPublico = () => {
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef(null);

  // Estado principal del formulario
  const [perfil, setPerfil] = useState({
    nombre: 'Gimena',
    apellido: '',
    especialidad: '',
    especialidadOtra: '', // Estado para la especialidad manual
    subtitulo: '',
    descripcion: '',
    modalidad: 'Presencial y Virtual',
    direccion: '',
    linkReunion: '',
    aceptaObrasSociales: false,
    obrasSocialesDetalle: '',
    duracionTurno: '30',
    slug: 'gimena-dev',
    diasHabilitados: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    fotoPerfil: null // Aquí guardaremos la URL de la imagen para la previsualización
  });

  const [slugDisponible, setSlugDisponible] = useState(true);

  // Manejador de cambios universal
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador para la selección de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo (opcional pero recomendado)
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      // Validar tamaño (opcional, ej: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPerfil(prev => ({
          ...prev,
          fotoPerfil: reader.result // Base64 de la imagen para previsualizar
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click(); // Simula el clic en el input oculto
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex flex-1 overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: EDITOR */}
        <section className="w-1/2 p-8 overflow-y-auto border-r border-gray-200 bg-white">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil Público</h1>

          {/* SECCIÓN IDENTIDAD */}
          <div className="space-y-6 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Identidad</h2>
            
            <div className="flex items-center gap-4">
              {/* Input de archivo oculto */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFotoChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {/* Contenedor de la foto clickable */}
              <div 
                onClick={triggerFileSelect}
                className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 overflow-hidden relative"
              >
                {perfil.fotoPerfil ? (
                  <img src={perfil.fotoPerfil} alt="Previsualización" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={24} />
                    <span className="text-[10px] mt-1">Upload</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white"/>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input 
                  type="text" name="nombre" placeholder="Nombre" 
                  value={perfil.nombre} onChange={handleChange}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="text" name="apellido" placeholder="Apellido" 
                  value={perfil.apellido} onChange={handleChange}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
                <select 
                name="especialidad" value={perfil.especialidad} onChange={handleChange}
                className="w-full p-2 border rounded-md outline-none"
                >
                <option value="">Seleccionar Especialidad</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Psicología">Psicología</option>
                <option value="Nutrición">Nutrición</option>
                <option value="otra">Otra...</option>
                </select>

                {/* Campo dinámico para 'otra' especialidad */}
                {perfil.especialidad === 'otra' && (
                    <input 
                        type="text" name="especialidadOtra" 
                        placeholder="Escribe tu especialidad"
                        value={perfil.especialidadOtra} onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none animate-fadeIn"
                    />
                )}
            </div>

            <textarea 
              name="descripcion" maxLength="280"
              placeholder="Cuéntale a tus pacientes sobre tu experiencia..."
              value={perfil.descripcion} onChange={handleChange}
              className="w-full p-2 border rounded-md h-24 resize-none outline-none"
            />
            <p className="text-right text-xs text-gray-400">{perfil.descripcion.length}/280 caracteres</p>
          </div>

          {/* SECCIÓN CONTACTO */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Contacto y Modalidad</h2>
            <div className="flex gap-4">
              {['Presencial', 'Virtual', 'Presencial y Virtual'].map(mod => (
                <label key={mod} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" name="modalidad" value={mod} 
                    checked={perfil.modalidad === mod} onChange={handleChange}
                  />
                  <span className="text-sm">{mod}</span>
                </label>
              ))}
            </div>
            
            {(perfil.modalidad === 'Presencial' || perfil.modalidad === 'Presencial y Virtual') && (
              <input 
                type="text" name="direccion" placeholder="Dirección del consultorio"
                value={perfil.direccion} onChange={handleChange}
                className="w-full p-2 border rounded-md outline-none"
              />
            )}

            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" name="aceptaObrasSociales" 
                checked={perfil.aceptaObrasSociales} onChange={handleChange}
                id="os"
              />
              <label htmlFor="os" className="text-sm font-medium text-gray-700">Acepta Obras Sociales</label>
            </div>
          </div>

          {/* SECCIÓN URL PÚBLICA */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">URL Pública</h2>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 select-none">turnosalud.com/</span>
              <input 
                type="text" name="slug" 
                value={perfil.slug} onChange={handleChange}
                // Aumentado el padding-left (pl-[125px]) para separar del texto fijo
                className="w-full p-2 pl-[125px] pr-10 border rounded-md outline-none font-mono text-sm"
              />
              <div className="absolute right-3 top-2.5">
                {slugDisponible ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
              </div>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: PREVIEW (FORMA DE CELULAR) */}
        <section className="w-1/2 bg-gray-100 p-12 flex justify-center items-center overflow-y-auto">
          {/* Contenedor del Celular */}
          <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] shadow-2xl border-[14px] border-black overflow-hidden flex flex-col">
            
            {/* Notch superior simulado */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
            </div>

            {/* Pantalla del celular */}
            <div className="flex-1 bg-white rounded-[26px] overflow-y-auto relative z-10 p-0 current-scr">
                {/* Header del Preview */}
                <div className="h-28 bg-blue-600 relative">
                  <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    {perfil.fotoPerfil ? (
                        <img src={perfil.fotoPerfil} alt="Foto Perfil" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 font-bold text-xs">FOTO</span>
                    )}
                  </div>
                </div>

                <div className="mt-10 p-5">
                  <h3 className="text-lg font-bold text-gray-800">
                    {perfil.nombre || 'Nombre'} {perfil.apellido || 'Apellido'}
                  </h3>
                  <p className="text-blue-600 font-medium text-xs">
                    {/* Muestra la especialidad manual si se seleccionó 'otra' */}
                    {perfil.especialidad === 'otra' ? perfil.especialidadOtra : (perfil.especialidad || 'Especialidad')}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1 italic">{perfil.subtitulo || 'Cargo / Matrícula'}</p>

                  <div className="mt-3 py-2.5 border-t border-b border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {perfil.descripcion || 'Aquí aparecerá tu descripción profesional...'}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-700">
                      {/* Aclaración solicitada */}
                      <strong>Modalidad de atención:</strong>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">{perfil.modalidad}</span>
                        {perfil.aceptaObrasSociales && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">Recibe Obras Sociales</span>}
                      </div>
                    </div>
                    {perfil.direccion && <p className="text-[11px] text-gray-500">📍 Consultorio: {perfil.direccion}</p>}
                  </div>

                  <button className="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200">
                    Reservar Turno
                  </button>
                </div>
            </div>

            {/* Botón de inicio simulado inferior */}
            <div className="h-6 w-full flex items-center justify-center bg-black relative z-20">
                <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER ACCIONES */}
      <footer className="h-20 bg-white border-t border-gray-200 px-8 flex items-center justify-between shadow-inner">
        <button className="flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm">
          Ver mi página pública <ExternalLink size={16} />
        </button>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Save size={18} /> Guardar cambios
        </button>
      </footer>

      {/* Pequeña animación CSS para la aparición de 'otra especialidad' */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
        }
        /* Ocultar scrollbar en el preview del celu */
        .current-scr::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
      `}</style>
    </div>
  );
};

export default PerfilPublico;