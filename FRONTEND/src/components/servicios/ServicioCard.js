import React from 'react';
import { PencilIcon, TrashIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const ServicioCard = ({ servicio, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el servicio "${servicio.nombre_servicio_peluqueria}"?`)) {
      onDelete(servicio);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
          {servicio.nombre_servicio_peluqueria}
        </h3>
        <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
          <ScissorsIcon className="w-3 h-3" />
          Servicio
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-4">
        {servicio.descripcion_servicio}
      </p>

      {/* Service Type Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
          <ScissorsIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Peluquería Canina</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-green-200">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onEdit(servicio)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
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

export default ServicioCard;