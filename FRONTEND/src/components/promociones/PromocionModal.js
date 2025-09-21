import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const PromocionModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  error, 
  mensaje,
  isEditing 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-2xl bg-white m-4 transform transition-all duration-300 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Promoción' : 'Nueva Promoción'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nombre de la Promoción"
            type="text"
            value={formData.nombre_promocion}
            onChange={(value) => handleInputChange('nombre_promocion', value)}
            placeholder="Ej: Descuento de temporada"
            required
          />

          <FormField
            label="Descripción"
            type="textarea"
            value={formData.descripcion_promocion}
            onChange={(value) => handleInputChange('descripcion_promocion', value)}
            placeholder="Describe los detalles de la promoción..."
            rows={3}
            required
          />

          <FormField
            label="Precio ($)"
            type="number"
            value={formData.precio_promocion}
            onChange={(value) => handleInputChange('precio_promocion', value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />

          <FormField
            label="Días de Promoción"
            type="number"
            value={formData.dias_promocion}
            onChange={(value) => handleInputChange('dias_promocion', value)}
            placeholder="Número de días"
            min="1"
            required
          />

          {error && <Alert type="error" message={error} />}
          {mensaje && <Alert type="success" message={mensaje} />}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {isEditing ? 'Actualizar' : 'Crear Promoción'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromocionModal;