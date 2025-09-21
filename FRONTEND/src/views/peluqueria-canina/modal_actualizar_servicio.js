import React, { useState, useEffect } from 'react';
import { XMarkIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ModalActualizarServicio = ({ servicio, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: ''
  });

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre_servicio_peluqueria: servicio.nombre_servicio_peluqueria || '',
        descripcion_servicio: servicio.descripcion_servicio || ''
      });
    }
  }, [servicio]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const validarFormulario = () => {
    if (!formData.nombre_servicio_peluqueria.trim()) {
      setError('El nombre del servicio es requerido');
      return false;
    }
    if (formData.nombre_servicio_peluqueria.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (!formData.descripcion_servicio.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (formData.descripcion_servicio.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setError('');
    
    try {
      const result = await onUpdate(servicio.id_servicio_peluqueria_pk, formData);
      if (result.success) {
        setMensaje('Servicio actualizado exitosamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('Error al actualizar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ScissorsIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Editar Servicio</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formData.nombre_servicio_peluqueria}
                onChange={(e) => handleInputChange('nombre_servicio_peluqueria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="Ej: Baño completo con corte"
                maxLength="100"
              />
              <p className="text-gray-500 text-xs mt-1">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Descripción del Servicio *
              </label>
              <textarea
                value={formData.descripcion_servicio}
                onChange={(e) => handleInputChange('descripcion_servicio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
                placeholder="Descripción detallada del servicio..."
                maxLength="500"
                rows={4}
              />
              <p className="text-gray-500 text-xs mt-1">Mínimo 10 caracteres</p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mt-4" />}
          {mensaje && <Alert type="success" message={mensaje} className="mt-4" />}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
            Actualizar Servicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalActualizarServicio;