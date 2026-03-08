export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Título o Breadcrumbs */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-slate-600">Panel Profesional</h1>
      </div>

    {/*Esto es El simbolo de notificacion arriba al lado del nombre*/}
     <div className="flex items-center gap-4"> 
        <button className="relative p-2 text-slate-400 hover:text-slate-600">
          {/*<span>🔔</span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>*/}
        </button> 
        
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">Dr. Martin 
              Garcia
            </p>
            <p className="text-xs text-slate-500">Médico Clínico</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-profesional flex items-center justify-center text-white font-bold text-xs">
            MG
          </div>
        </div>
      </div>
    </header>
  )
}