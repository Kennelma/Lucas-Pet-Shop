import React from 'react';
import { PencilIcon, TrashIcon, CurrencyDollarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const PromocionCard = ({ promocion, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la promoción "${promocion.nombre_promocion}"?`)) {
      onDelete(promocion);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
          {promocion.nombre_promocion}
        </h3>
        <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
          Promoción
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
        {promocion.descripcion_promocion}
      </p>

      {/* Price and Duration */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-bold text-xl">
            ${parseFloat(promocion.precio_promocion).toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
          <CalendarDaysIcon className="w-5 h-5 text-orange-600" />
          <span className="text-orange-700 font-semibold">
            {promocion.dias_promocion} días
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-blue-200">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onEdit(promocion)}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <PencilIcon className="w-4 h-4" />
          Editar
        </Button>
        
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export default PromocionCard;