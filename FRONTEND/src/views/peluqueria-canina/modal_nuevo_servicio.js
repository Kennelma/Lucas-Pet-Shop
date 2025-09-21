import React, { useState } from 'react';
import { XMarkIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ModalNuevoServicio = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: ''
  });

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
      const result = await onCreate(formData);
      if (result.success) {
        setMensaje('Servicio creado exitosamente');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
              <ScissorsIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <h3 className="modal-title">Nuevo Servicio</h3>
          </div>
          <button onClick={onClose} className="modal-close">
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={formData.nombre_servicio_peluqueria}
              onChange={(e) => handleInputChange('nombre_servicio_peluqueria', e.target.value)}
              className="form-input input-green"
              placeholder="Ej: Baño completo con corte"
              maxLength="100"
            />
            <p className="form-hint">Mínimo 3 caracteres</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Descripción del Servicio *
            </label>
            <textarea
              value={formData.descripcion_servicio}
              onChange={(e) => handleInputChange('descripcion_servicio', e.target.value)}
              className="form-input form-textarea input-green"
              placeholder="Descripción detallada del servicio..."
              maxLength="500"
            />
            <p className="form-hint">Mínimo 10 caracteres</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          {mensaje && (
            <div className="alert alert-success">
              {mensaje}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? 'Guardando...' : 'Crear Servicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevoServicio;