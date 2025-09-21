import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ModalNuevaPromocion = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores al escribir
    if (error) setError('');
  };

  const validarFormulario = () => {
    if (!formData.nombre_promocion.trim()) {
      setError('El nombre de la promoción es requerido');
      return false;
    }
    if (formData.nombre_promocion.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (!formData.descripcion_promocion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (formData.descripcion_promocion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return false;
    }
    if (!formData.precio_promocion || parseFloat(formData.precio_promocion) <= 0) {
      setError('El precio debe ser un número mayor a 0');
      return false;
    }
    if (!formData.dias_promocion || parseInt(formData.dias_promocion) <= 0) {
      setError('Los días deben ser un número mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setError('');
    
    try {
      const result = await onCreate(formData);
      if (result.success) {
        setMensaje('Promoción creada exitosamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('Error al crear la promoción');
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nueva Promoción</h3>
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
                Nombre de la Promoción *
              </label>
              <input
                type="text"
                value={formData.nombre_promocion}
                onChange={(e) => handleInputChange('nombre_promocion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Ej: Descuento de temporada"
                maxLength="100"
              />
              <p className="text-gray-500 text-xs mt-1">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion_promocion}
                onChange={(e) => handleInputChange('descripcion_promocion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                placeholder="Describe los detalles de la promoción..."
                maxLength="500"
                rows={4}
              />
              <p className="text-gray-500 text-xs mt-1">Mínimo 10 caracteres</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Precio ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.precio_promocion}
                onChange={(e) => handleInputChange('precio_promocion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0.00"
              />
              <p className="text-gray-500 text-xs mt-1">Precio en dólares</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Días de Promoción *
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.dias_promocion}
                onChange={(e) => handleInputChange('dias_promocion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Número de días"
              />
              <p className="text-gray-500 text-xs mt-1">Entre 1 y 365 días</p>
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
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Crear Promoción
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevaPromocion;