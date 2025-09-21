import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const ServicioModal = ({ 
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

  const handleSubmit = () => {
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
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <FormField
            label="Nombre del Servicio"
            type="text"
            value={formData.nombre_servicio_peluqueria}
            onChange={(value) => handleInputChange('nombre_servicio_peluqueria', value)}
            placeholder="Ej: Baño completo con corte"
            required
          />

          <FormField
            label="Descripción del Servicio"
            type="textarea"
            value={formData.descripcion_servicio}
            onChange={(value) => handleInputChange('descripcion_servicio', value)}
            placeholder="Descripción detallada del servicio..."
            rows={4}
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
              variant="success"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {isEditing ? 'Actualizar' : 'Crear Servicio'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicioModal;