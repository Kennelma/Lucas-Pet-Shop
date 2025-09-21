import { useEffect, useState } from "react";
import { ScissorsIcon } from '@heroicons/react/24/outline';

export default function ModalServicio({ isOpen, onClose, onSubmit, servicio = null }) {
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: ''
  });

  useEffect(() => {
    setFormData({
      nombre_servicio_peluqueria: servicio?.nombre_servicio_peluqueria || '',
      descripcion_servicio: servicio?.descripcion_servicio || ''
    });
  }, [servicio]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Agregar el id_categoria_item_fk para servicios (según tu PDF = 1)
    const dataToSend = {
      ...formData,
      id_categoria_item_fk: 1
    };
    
    onSubmit(dataToSend);
  };

  const handleClose = () => {
    setFormData({ 
      nombre_servicio_peluqueria: '',
      descripcion_servicio: ''
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
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
              <ScissorsIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <h3 className="modal-title">
              {servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
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
              <label htmlFor="nombre_servicio_peluqueria" className="form-label">
                Nombre del Servicio
              </label>
              <input
                type="text"
                name="nombre_servicio_peluqueria"
                id="nombre_servicio_peluqueria"
                value={formData.nombre_servicio_peluqueria}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Baño completo con corte"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion_servicio" className="form-label">
                Descripción del Servicio
              </label>
              <textarea
                name="descripcion_servicio"
                id="descripcion_servicio"
                value={formData.descripcion_servicio}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Descripción detallada del servicio..."
                required
              />
            </div>
            
            {/* Botones */}
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-success"
              >
                {servicio ? 'Actualizar' : 'Guardar'} Servicio
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