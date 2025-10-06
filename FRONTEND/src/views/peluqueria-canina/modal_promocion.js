import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ModalPromocion({ isOpen, onClose, onSubmit, promocion = null }) {
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  const [errores, setErrores] = useState({});

  // Días de la semana
  const diasSemana = [
    { id: 'domingo', nombre: 'Domingo', abrev: 'Dom' },
    { id: 'lunes', nombre: 'Lunes', abrev: 'Lun' },
    { id: 'martes', nombre: 'Martes', abrev: 'Mar' },
    { id: 'miercoles', nombre: 'Miércoles', abrev: 'Mié' },
    { id: 'jueves', nombre: 'Jueves', abrev: 'Jue' },
    { id: 'viernes', nombre: 'Viernes', abrev: 'Vie' },
    { id: 'sabado', nombre: 'Sábado', abrev: 'Sáb' }
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre_promocion: promocion?.nombre_promocion || '',
        descripcion_promocion: promocion?.descripcion_promocion || '',
        precio_promocion: promocion?.precio_promocion || '',
        dias_promocion: promocion?.dias_promocion || []
      });
      setErrores({});
    }
  }, [promocion, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  // Toggle día de la semana
  const toggleDia = (diaId) => {
    setFormData(prev => {
      const diasActuales = prev.dias_promocion;
      const nuevosDias = diasActuales.includes(diaId)
        ? diasActuales.filter(d => d !== diaId)
        : [...diasActuales, diaId];
      return { ...prev, dias_promocion: nuevosDias };
    });
    
    // Limpiar error de días si existe
    if (errores.dias_promocion) {
      setErrores(prev => ({ ...prev, dias_promocion: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre_promocion.trim()) {
      nuevosErrores.nombre_promocion = 'El nombre es requerido';
    } else if (formData.nombre_promocion.trim().length < 3) {
      nuevosErrores.nombre_promocion = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion_promocion.trim()) {
      nuevosErrores.descripcion_promocion = 'La descripción es requerida';
    } else if (formData.descripcion_promocion.trim().length < 10) {
      nuevosErrores.descripcion_promocion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    const precio = parseFloat(formData.precio_promocion);
    if (!formData.precio_promocion || isNaN(precio)) {
      nuevosErrores.precio_promocion = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precio_promocion = 'El precio debe ser mayor a 0';
    } else if (precio > 10000) {
      nuevosErrores.precio_promocion = 'El precio parece demasiado alto (máx: L. 10,000)';
    }
    
    if (formData.dias_promocion.length === 0) {
      nuevosErrores.dias_promocion = 'Debes seleccionar al menos un día';
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
      dias_promocion: [] 
    });
    setErrores({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
              <SparklesIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <h3 className="modal-title">{promocion ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
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
              {errores.nombre_promocion && <p className="form-error">{errores.nombre_promocion}</p>}
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
              {errores.descripcion_promocion && <p className="form-error">{errores.descripcion_promocion}</p>}
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
              {errores.precio_promocion && <p className="form-error">{errores.precio_promocion}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Días de la Promoción <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="days-selector">
                {diasSemana.map(dia => (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => toggleDia(dia.id)}
                    className={`day-button ${formData.dias_promocion.includes(dia.id) ? 'selected' : ''}`}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{dia.abrev}</div>
                    <div style={{ fontSize: '0.65rem', marginTop: '2px', opacity: '0.8' }}>
                      {dia.nombre}
                    </div>
                  </button>
                ))}
              </div>
              <p className="form-hint">
                Selecciona los días de la semana en que aplica esta promoción
              </p>
              {errores.dias_promocion && <p className="form-error">{errores.dias_promocion}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {promocion ? 'Actualizar' : 'Guardar'} Promoción
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}