import { useEffect, useState } from "react";
import { ScissorsIcon } from '@heroicons/react/24/outline';

export default function ModalServicio({ isOpen, onClose, onSubmit, servicio = null }) {
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: '',
    precio_servicio: '',
    duracion_estimada: '',
    requisitos: '',
    activo: true
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre_servicio_peluqueria: servicio?.nombre_servicio_peluqueria || '',
        descripcion_servicio: servicio?.descripcion_servicio || '',
        precio_servicio: servicio?.precio_servicio || '',
        duracion_estimada: servicio?.duracion_estimada || '',
        requisitos: servicio?.requisitos || '',
        activo: servicio?.activo ?? true
      });
      setErrores({});
    }
  }, [servicio, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre_servicio_peluqueria.trim()) {
      nuevosErrores.nombre_servicio_peluqueria = 'El nombre es requerido';
    } else if (formData.nombre_servicio_peluqueria.trim().length < 3) {
      nuevosErrores.nombre_servicio_peluqueria = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!formData.descripcion_servicio.trim()) {
      nuevosErrores.descripcion_servicio = 'La descripción es requerida';
    } else if (formData.descripcion_servicio.trim().length < 10) {
      nuevosErrores.descripcion_servicio = 'La descripción debe tener al menos 10 caracteres';
    }
    const precio = parseFloat(formData.precio_servicio);
    if (!formData.precio_servicio || isNaN(precio)) {
      nuevosErrores.precio_servicio = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precio_servicio = 'El precio debe ser mayor a 0';
    } else if (precio > 10000) {
      nuevosErrores.precio_servicio = 'El precio parece demasiado alto (máx: L. 10,000)';
    }
    const duracion = parseInt(formData.duracion_estimada);
    if (!formData.duracion_estimada || isNaN(duracion)) {
      nuevosErrores.duracion_estimada = 'La duración es requerida';
    } else if (duracion <= 0) {
      nuevosErrores.duracion_estimada = 'La duración debe ser mayor a 0 minutos';
    } else if (duracion < 5) {
      nuevosErrores.duracion_estimada = 'La duración mínima es 5 minutos';
    } else if (duracion > 480) {
      nuevosErrores.duracion_estimada = 'La duración máxima es 480 minutos (8 horas)';
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
    const dataToSubmit = {
      nombre_servicio_peluqueria: formData.nombre_servicio_peluqueria,
      descripcion_servicio: formData.descripcion_servicio,
      precio_servicio: formData.precio_servicio,
      duracion_estimada: formData.duracion_estimada,
      requisitos: formData.requisitos,
      activo: formData.activo
    };
    
    onSubmit(dataToSubmit);
  };

  const handleClose = () => {
    setFormData({ nombre_servicio_peluqueria: '', descripcion_servicio: '', precio_servicio: '', duracion_estimada: '', requisitos: '', activo: true });
    setErrores({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
              <ScissorsIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
            <h3 className="modal-title">{servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          </div>
          <button onClick={handleClose} className="modal-close">
            <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre_servicio_peluqueria" className="form-label">Nombre del Servicio <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="nombre_servicio_peluqueria" id="nombre_servicio_peluqueria" value={formData.nombre_servicio_peluqueria} onChange={handleChange} className={`form-input ${errores.nombre_servicio_peluqueria ? 'input-error' : ''}`} placeholder="Ej: Baño completo con corte" />
              {errores.nombre_servicio_peluqueria && <p className="form-error">{errores.nombre_servicio_peluqueria}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="descripcion_servicio" className="form-label">Descripción del Servicio <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea name="descripcion_servicio" id="descripcion_servicio" value={formData.descripcion_servicio} onChange={handleChange} className={`form-input form-textarea ${errores.descripcion_servicio ? 'input-error' : ''}`} placeholder="Descripción detallada del servicio..." />
              {errores.descripcion_servicio && <p className="form-error">{errores.descripcion_servicio}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="precio_servicio" className="form-label">Precio del Servicio (L) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" step="0.01" name="precio_servicio" id="precio_servicio" value={formData.precio_servicio} onChange={handleChange} className={`form-input ${errores.precio_servicio ? 'input-error' : ''}`} placeholder="0.00" />
              {errores.precio_servicio && <p className="form-error">{errores.precio_servicio}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="duracion_estimada" className="form-label">Duración Estimada (minutos) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" name="duracion_estimada" id="duracion_estimada" value={formData.duracion_estimada} onChange={handleChange} className={`form-input ${errores.duracion_estimada ? 'input-error' : ''}`} placeholder="Ej: 60" />
              <p className="form-hint">Tiempo aproximado en minutos (mín: 5, máx: 480)</p>
              {errores.duracion_estimada && <p className="form-error">{errores.duracion_estimada}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="requisitos" className="form-label">Requisitos del Servicio</label>
              <textarea name="requisitos" id="requisitos" value={formData.requisitos} onChange={handleChange} className="form-input form-textarea" placeholder="Ej: Mascota vacunada, sin pulgas, temperamento tranquilo..." style={{ minHeight: '80px' }} />
              <p className="form-hint">Requisitos o condiciones para el servicio (opcional)</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-success">{servicio ? 'Actualizar' : 'Guardar'} Servicio</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}