import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ModalActualizarPromocion = ({ promocion, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  useEffect(() => {
    if (promocion) {
      setFormData({
        nombre_promocion: promocion.nombre_promocion || '',
        descripcion_promocion: promocion.descripcion_promocion || '',
        precio_promocion: promocion.precio_promocion || '',
        dias_promocion: promocion.dias_promocion || ''
      });
    }
  }, [promocion]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      const result = await onUpdate(promocion.id_promocion_pk, formData);
      if (result.success) {
        setMensaje('Promoción actualizada exitosamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('Error al actualizar la promoción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="modal-title">Editar Promoción</h3>
          </div>
          <button onClick={onClose} className="modal-close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-vertical">
            <div className="form-group">
              <label className="form-label">
                Nombre de la Promoción *
              </label>
              <input
                type="text"
                value={formData.nombre_promocion}
                onChange={(e) => handleInputChange('nombre_promocion', e.target.value)}
                className="form-input input-blue"
                placeholder="Ej: Descuento de temporada"
                maxLength="100"
              />
              <p className="form-hint">Mínimo 3 caracteres</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion_promocion}
                onChange={(e) => handleInputChange('descripcion_promocion', e.target.value)}
                className="form-textarea input-blue"
                placeholder="Describe los detalles de la promoción..."
                maxLength="500"
              />
              <p className="form-hint">Mínimo 10 caracteres</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Precio ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.precio_promocion}
                onChange={(e) => handleInputChange('precio_promocion', e.target.value)}
                className="form-input input-blue"
                placeholder="0.00"
              />
              <p className="form-hint">Precio en dólares</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Días de Promoción *
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.dias_promocion}
                onChange={(e) => handleInputChange('dias_promocion', e.target.value)}
                className="form-input input-blue"
                placeholder="Número de días"
              />
              <p className="form-hint">Entre 1 y 365 días</p>
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mt-4" />}
          {mensaje && <Alert type="success" message={mensaje} className="mt-4" />}
        </div>

        {/* Footer */}
        <div className="modal-footer">
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
            Actualizar Promoción
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalActualizarPromocion;