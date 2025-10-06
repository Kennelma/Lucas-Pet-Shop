import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ModalPromocion({ isOpen, onClose, onSubmit, promocion = null }) {
  console.log('ModalPromocion renderizado - isOpen:', isOpen, 'promocion:', promocion);
  
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: []
  });

  const [errores, setErrores] = useState({});

  const diasSemana = [
    { id: 'LUNES', label: 'LUNES' },
    { id: 'MARTES', label: 'MARTES' },
    { id: 'MIÉRCOLES', label: 'MIÉRCOLES' },
    { id: 'JUEVES', label: 'JUEVES' },
    { id: 'VIERNES', label: 'VIERNES' },
    { id: 'SÁBADO', label: 'SÁBADO' },
    { id: 'DOMINGO', label: 'DOMINGO' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Parsear dias_promocion si viene como string desde la BD
      let diasPromocion = [];
      if (promocion?.dias_promocion) {
        try {
          // Si es un string, intentar parsearlo como JSON
          if (typeof promocion.dias_promocion === 'string') {
            diasPromocion = JSON.parse(promocion.dias_promocion);
          } else if (Array.isArray(promocion.dias_promocion)) {
            diasPromocion = promocion.dias_promocion;
          }
        } catch (error) {
          console.warn('Error parseando dias_promocion:', error);
          diasPromocion = [];
        }
      }

      setFormData({
        nombre_promocion: promocion?.nombre_promocion || '',
        descripcion_promocion: promocion?.descripcion_promocion || '',
        precio_promocion: promocion?.precio_promocion || '',
        dias_promocion: diasPromocion
      });
      setErrores({});
    }
  }, [promocion, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleDiaToggle = (diaId) => {
    setFormData(prev => {
      const nuevos_dias = prev.dias_promocion.includes(diaId)
        ? prev.dias_promocion.filter(dia => dia !== diaId)
        : [...prev.dias_promocion, diaId];
      return { ...prev, dias_promocion: nuevos_dias };
    });
    if (errores.dias_promocion) setErrores(prev => ({ ...prev, dias_promocion: '' }));
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
    if (!formData.dias_promocion || formData.dias_promocion.length === 0) {
      nuevosErrores.dias_promocion = 'Debe seleccionar al menos un día de la semana';
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
    
    // Convertir array a string para la base de datos
    const dataParaEnviar = {
      ...formData,
      dias_promocion: JSON.stringify(formData.dias_promocion)
    };
    
    console.log('Datos del formulario:', formData);
    console.log('Datos para enviar:', dataParaEnviar);
    
    onSubmit(dataParaEnviar);
  };

  const handleClose = () => {
    setFormData({ nombre_promocion: '', descripcion_promocion: '', precio_promocion: '', dias_promocion: [] });
    setErrores({});
    onClose();
  };

  console.log('Verificando si mostrar modal - isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Modal no se muestra porque isOpen es false');
    return null;
  }

  console.log('Modal se va a mostrar');
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
              <SparklesIcon style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <h3 className="modal-title font-poppins">{promocion ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
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
              <label htmlFor="nombre_promocion" className="form-label font-poppins">Nombre de la Promoción <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="nombre_promocion" id="nombre_promocion" value={formData.nombre_promocion} onChange={handleChange} className={`form-input font-poppins ${errores.nombre_promocion ? 'input-error' : ''}`} placeholder="Ej: Promoción Baño + Corte" />
              {errores.nombre_promocion && <p className="form-error font-poppins">{errores.nombre_promocion}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="descripcion_promocion" className="form-label font-poppins">Descripción de la Promoción <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea name="descripcion_promocion" id="descripcion_promocion" value={formData.descripcion_promocion} onChange={handleChange} className={`form-input form-textarea font-poppins ${errores.descripcion_promocion ? 'input-error' : ''}`} placeholder="Descripción detallada de la promoción..." />
              {errores.descripcion_promocion && <p className="form-error font-poppins">{errores.descripcion_promocion}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="precio_promocion" className="form-label font-poppins">Precio de la Promoción (L) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" step="0.01" name="precio_promocion" id="precio_promocion" value={formData.precio_promocion} onChange={handleChange} className={`form-input font-poppins ${errores.precio_promocion ? 'input-error' : ''}`} placeholder="0.00" />
              {errores.precio_promocion && <p className="form-error font-poppins">{errores.precio_promocion}</p>}
            </div>
            <div className="form-group">
              <label className="form-label font-poppins">Días de la Promoción <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '8px' }}>
                {diasSemana.map(dia => (
                  <div key={dia.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id={dia.id}
                      checked={formData.dias_promocion.includes(dia.id)}
                      onChange={() => handleDiaToggle(dia.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <label 
                      htmlFor={dia.id} 
                      style={{ 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: formData.dias_promocion.includes(dia.id) ? '600' : '400',
                        color: formData.dias_promocion.includes(dia.id) ? '#3b82f6' : '#6b7280',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="form-hint">Seleccione los días de la semana en que estará disponible la promoción</p>
              {errores.dias_promocion && <p className="form-error">{errores.dias_promocion}</p>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary">{promocion ? 'Actualizar' : 'Guardar'} Promoción</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}