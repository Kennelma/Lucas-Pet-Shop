import React from 'react';
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const PromocionesSeccion = ({ promociones, abrirModalPromocion, eliminarPromocion }) => {
  
  const handleEliminar = (promocion) => {
    const confirmacion = window.confirm(
      `🗑️ ¿Estás seguro de que deseas eliminar la promoción?\n\n` +
      `📝 Nombre: ${promocion.nombre_promocion}\n` +
      `💰 Precio: L. ${parseFloat(promocion.precio_promocion).toFixed(2)}\n` +
      `📅 Duración: ${promocion.dias_promocion} días\n\n` +
      `⚠️ Esta acción no se puede deshacer.`
    );
    
    if (confirmacion) {
      eliminarPromocion(promocion.id_promocion_pk);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 animate-slide-in">
      
      {/* Header de la sección */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Promociones</h2>
        </div>
        
        <button
          onClick={() => abrirModalPromocion(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium 
                     transform hover:scale-105 transition-all duration-200 
                     flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Promoción
        </button>
      </div>

      {/* Estado vacío */}
      {promociones.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay promociones</h3>
          <p className="text-gray-500 mb-6">Crea tu primera promoción para atraer clientes.</p>
          <button 
            onClick={() => abrirModalPromocion(null)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl 
                       font-medium transform hover:scale-105 transition-all duration-200 
                       flex items-center gap-2 mx-auto shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Promoción
          </button>
        </div>
      ) : (
        
        /* Grid de promociones - 3 columnas responsive */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promociones.map((promocion, index) => (
            <div 
              key={promocion.id_promocion_pk} 
              className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 
                         border-2 border-blue-300 rounded-2xl p-6 
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
                  <FireIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                  {promocion.nombre_promocion}
                </h3>
                <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 
                               rounded-full flex items-center gap-1 whitespace-nowrap">
                  <SparklesIcon className="w-3 h-3" />
                  Promoción
                </span>
              </div>
              
              {/* Descripción */}
              <p className="text-gray-600 text-sm mb-5 flex-1 line-clamp-3">
                {promocion.descripcion_promocion}
              </p>
              
              {/* Detalles */}
              <div className="bg-white bg-opacity-60 rounded-xl p-4 mb-5 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Precio:
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    L. {parseFloat(promocion.precio_promocion).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Duración:
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {promocion.dias_promocion} días
                  </span>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => abrirModalPromocion(promocion)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 
                           rounded-lg font-medium transition-colors duration-200 
                           flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(promocion)}
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

export default PromocionesSeccion;