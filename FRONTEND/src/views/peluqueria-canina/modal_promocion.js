import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ModalPromocion({ isOpen, onClose, onSubmit, promocion = null }) {
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  useEffect(() => {
    setFormData({
      nombre_promocion: promocion?.nombre_promocion || '',
      descripcion_promocion: promocion?.descripcion_promocion || '',
      precio_promocion: promocion?.precio_promocion || '',
      dias_promocion: promocion?.dias_promocion || ''
    });
  }, [promocion]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ 
      nombre_promocion: '',
      descripcion_promocion: '',
      precio_promocion: '',
      dias_promocion: ''
    });
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
                Nombre de la Promoción
              </label>
              <input
                type="text"
                name="nombre_promocion"
                id="nombre_promocion"
                value={formData.nombre_promocion}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Descuento de temporada"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion_promocion" className="form-label">
                Descripción
              </label>
              <textarea
                name="descripcion_promocion"
                id="descripcion_promocion"
                value={formData.descripcion_promocion}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Describe los detalles de la promoción..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="precio_promocion" className="form-label">
                Precio ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="precio_promocion"
                id="precio_promocion"
                value={formData.precio_promocion}
                onChange={handleChange}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dias_promocion" className="form-label">
                Días de Promoción
              </label>
              <input
                type="number"
                min="1"
                max="365"
                name="dias_promocion"
                id="dias_promocion"
                value={formData.dias_promocion}
                onChange={handleChange}
                className="form-input"
                placeholder="Número de días"
                required
              />
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