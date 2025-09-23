import React from 'react';
import { 
  ScissorsIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  HeartIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const ServiciosSeccion = ({ servicios, abrirModalServicio, eliminarServicio }) => {
  
  const handleEliminar = (servicio) => {
    const confirmacion = window.confirm(
      `🗑️ ¿Estás seguro de que deseas eliminar este servicio?\n\n` +
      `📝 Nombre: ${servicio.nombre_servicio_peluqueria}\n` +
      `💰 Precio: L. ${parseFloat(servicio.precio_servicio || 0).toFixed(2)}\n` +
      `📋 Descripción: ${servicio.descripcion_servicio.substring(0, 50)}...\n\n` +
      `⚠️ Esta acción no se puede deshacer.`
    );
    
    if (confirmacion) {
      eliminarServicio(servicio.id_servicio_peluqueria_pk);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 animate-slide-in">
      
      {/* Header de la sección */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ScissorsIcon className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        </div>
        
        <button
          onClick={() => abrirModalServicio(null)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium 
                     transform hover:scale-105 transition-all duration-200 
                     flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Estado vacío */}
      {servicios.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <ScissorsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay servicios</h3>
          <p className="text-gray-500 mb-6">Crea tu primer servicio de peluquería canina.</p>
          <button 
            onClick={() => abrirModalServicio(null)} 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl 
                       font-medium transform hover:scale-105 transition-all duration-200 
                       flex items-center gap-2 mx-auto shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Servicio
          </button>
        </div>
      ) : (
        
        /* Grid de servicios - 3 columnas responsive */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio, index) => (
            <div 
              key={servicio.id_servicio_peluqueria_pk} 
              className="group relative bg-gradient-to-br from-green-50 to-emerald-50 
                         border-2 border-green-300 rounded-2xl p-6 
                         transform hover:-translate-y-2 hover:shadow-xl 
                         transition-all duration-300 min-h-[320px] flex flex-col"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInFromBottom 0.6s ease-out'
              }}
            >
              
              {/* Header de la carta */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1 mr-3 leading-tight flex items-center">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  {servicio.nombre_servicio_peluqueria}
                </h3>
                <span className="bg-green-200 text-green-800 text-xs font-medium px-3 py-1 
                               rounded-full flex items-center gap-1 whitespace-nowrap">
                  <ScissorsIcon className="w-3 h-3" />
                  Servicio
                </span>
              </div>
              
              {/* Descripción */}
              <p className="text-gray-600 text-sm mb-5 flex-1 line-clamp-3">
                {servicio.descripcion_servicio}
              </p>
              
              {/* Detalles */}
              <div className="bg-white bg-opacity-60 rounded-xl p-4 mb-5 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Precio:
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    L. {parseFloat(servicio.precio_servicio || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Calidad:
                  </span>
                  <span className="text-gray-700 font-semibold flex items-center gap-1">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    Premium
                  </span>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => abrirModalServicio(servicio)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 
                           rounded-lg font-medium transition-colors duration-200 
                           flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(servicio)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 
                           rounded-lg font-medium transition-colors duration-200 
                           flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSS personalizado para animaciones avanzadas */}
      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .animate-slide-in {
          animation: slideInFromBottom 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ServiciosSeccion;