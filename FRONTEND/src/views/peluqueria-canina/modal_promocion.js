import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ModalPromocion({ isOpen, onClose, onSubmit, promocion = null }) {
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: '',
    activo: true
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    setFormData({
      nombre_promocion: promocion?.nombre_promocion || '',
      descripcion_promocion: promocion?.descripcion_promocion || '',
      precio_promocion: promocion?.precio_promocion || '',
      dias_promocion: promocion?.dias_promocion || '',
      activo: promocion?.activo ?? true
    });
    setErrores({});
  }, [promocion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre
    if (!formData.nombre_promocion.trim()) {
      nuevosErrores.nombre_promocion = 'El nombre es requerido';
    } else if (formData.nombre_promocion.trim().length < 3) {
      nuevosErrores.nombre_promocion = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar descripción
    if (!formData.descripcion_promocion.trim()) {
      nuevosErrores.descripcion_promocion = 'La descripción es requerida';
    } else if (formData.descripcion_promocion.trim().length < 10) {
      nuevosErrores.descripcion_promocion = 'La descripción debe tener al menos 10 caracteres';
    }

    // Validar precio
    const precio = parseFloat(formData.precio_promocion);
    if (!formData.precio_promocion || isNaN(precio)) {
      nuevosErrores.precio_promocion = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precio_promocion = 'El precio debe ser mayor a 0';
    } else if (precio > 10000) {
      nuevosErrores.precio_promocion = 'El precio parece demasiado alto (máx: L. 10,000)';
    }

    // Validar días de promoción
    const dias = parseInt(formData.dias_promocion);
    if (!formData.dias_promocion || isNaN(dias)) {
      nuevosErrores.dias_promocion = 'Los días son requeridos';
    } else if (dias <= 0) {
      nuevosErrores.dias_promocion = 'Los días deben ser mayor a 0';
    } else if (dias < 1) {
      nuevosErrores.dias_promocion = 'La duración mínima es 1 día';
    } else if (dias > 365) {
      nuevosErrores.dias_promocion = 'La duración máxima es 365 días';
    }

    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const nuevosErrores = validarFormulario();
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ 
      nombre_promocion: '',
      descripcion_promocion: '',
      precio_promocion: '',
      dias_promocion: '',
      activo: true
    });
    setErrores({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
              <SparklesIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <h3 className="modal-title">
              {promocion ? 'Editar Promoción' : 'Nueva Promoción'}
            </h3>
          </div>
          <button onClick={handleClose} className="modal-close">
            <svg style={{ width: '24px', height: '24px' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre_promocion" className="form-label">
                Nombre de la Promoción <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="nombre_promocion"
                id="nombre_promocion"
                value={formData.nombre_promocion}
                onChange={handleChange}
                className={`form-input ${errores.nombre_promocion ? 'input-error' : ''}`}
                placeholder="Ej: Promoción Baño + Corte"
              />
              {errores.nombre_promocion && (
                <p className="form-error">{errores.nombre_promocion}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion_promocion" className="form-label">
                Descripción de la Promoción <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="descripcion_promocion"
                id="descripcion_promocion"
                value={formData.descripcion_promocion}
                onChange={handleChange}
                className={`form-input form-textarea ${errores.descripcion_promocion ? 'input-error' : ''}`}
                placeholder="Descripción detallada de la promoción..."
              />
              {errores.descripcion_promocion && (
                <p className="form-error">{errores.descripcion_promocion}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="precio_promocion" className="form-label">
                Precio de la Promoción (L) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="precio_promocion"
                id="precio_promocion"
                value={formData.precio_promocion}
                onChange={handleChange}
                className={`form-input ${errores.precio_promocion ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errores.precio_promocion && (
                <p className="form-error">{errores.precio_promocion}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dias_promocion" className="form-label">
                Duración de la Promoción (días) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="dias_promocion"
                id="dias_promocion"
                value={formData.dias_promocion}
                onChange={handleChange}
                className={`form-input ${errores.dias_promocion ? 'input-error' : ''}`}
                placeholder="Ej: 30"
              />
              <p className="form-hint">Número de días que estará vigente la promoción (mín: 1, máx: 365)</p>
              {errores.dias_promocion && (
                <p className="form-error">{errores.dias_promocion}</p>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Promoción activa
                </span>
              </label>
              <p className="form-hint">Desactiva la promoción si no está disponible temporalmente</p>
            </div>
            
            {/* Botones */}
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {promocion ? 'Actualizar' : 'Guardar'} Promoción
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}