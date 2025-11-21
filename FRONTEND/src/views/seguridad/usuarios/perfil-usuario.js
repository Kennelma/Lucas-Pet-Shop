import React, { useState, useRef } from "react";
import userImage from "../../clientes/clientes-dog.png";

const ActionMenu = ({ usuario, onEditar, onEliminar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title="Más opciones"
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10  border border-gray-200 rounded-lg shadow-lg min-w-[140px] z-50"
        >
          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEditar(usuario);
            }}
          >
            <i className="pi pi-pencil text-xs"></i>
            <span className="uppercase">Editar</span>
          </div>

          <hr className="my-0 border-gray-200" />

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEliminar(usuario);
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            <span className="uppercase">Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};

const PerfilUsuario = ({ usuarioSeleccionado, onEditar, onEliminar }) => {
  const getIntentosBadge = (intentos) => {
    if (intentos === 0) return { color: 'bg-green-100 text-green-800 border-green-200', icon: '✓' };
    if (intentos <= 2) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠' };
    return { color: 'bg-red-100 text-red-800 border-red-200', icon: '✕' };
  };

  const getEstadoColor = (estado) => {
    const lower = (estado || '').toLowerCase();
    if (lower === 'activo') return 'bg-green-500';
    if (lower === 'bloqueado') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estaBloqueado = (fechaBloqueo) => {
    if (!fechaBloqueo) return false;
    const ahora = new Date();
    const fechaBloqueoDate = new Date(fechaBloqueo);
    return fechaBloqueoDate > ahora;
  };

  return (
    <div className="flex flex-col w-full h-full bg-green-50">
      <div className="flex-shrink-0 w-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex-1 text-center font-semibold text-gray-700 font-poppins uppercase text-sm tracking-wide">
              Perfil de Usuario
            </span>
            {usuarioSeleccionado && (
              <ActionMenu
                usuario={usuarioSeleccionado}
                onEditar={onEditar}
                onEliminar={onEliminar}
              />
            )}
          </div>

          {usuarioSeleccionado ? (
            <div className="mt-4 flex flex-col items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex justify-center">
                  <img
                    src={userImage}
                    alt="Usuario"
                    className="w-20 h-20 object-cover rounded-full border-[3px] border-white shadow-lg"
                  />
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white shadow-md ${getEstadoColor(usuarioSeleccionado.estado)}`} />
                </div>

                <div className="text-center w-full">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {usuarioSeleccionado.usuario}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {usuarioSeleccionado.email_usuario}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Sucursal: {usuarioSeleccionado.nombreSucursal || 'Sin sucursal'}</span>
                  </p>
                
                  {/* Bloqueado hasta - solo se muestra si aún está bloqueado */}
                  {estaBloqueado(usuarioSeleccionado.bloqueadoHasta) && (
                    <div className="flex flex-col gap-1 w-full items-center mt-2">
                      <span className="text-gray-600 font-medium text-xs text-center">Bloqueado hasta:</span>
                      <div className="px-3 py-2 rounded-lg text-xs font-semibold text-center bg-red-50 text-red-700 border border-red-200 w-fit mx-auto">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span className="break-all">{formatearFecha(usuarioSeleccionado.bloqueadoHasta)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">Selecciona un usuario</p>
              <p className="text-gray-400 text-xs mt-1">para ver su perfil detallado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
