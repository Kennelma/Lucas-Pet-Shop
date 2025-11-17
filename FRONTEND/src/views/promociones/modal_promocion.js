import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function ModalPromocion({ 
  isOpen, 
  onClose, 
  onSubmit, 
  promocion = null,
  promocionesExistentes = [] // 👈 NUEVO: Lista de promociones para validar duplicados
}) {
  console.log('ModalPromocion renderizado - isOpen:', isOpen, 'promocion:', promocion);
  
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: [],
    activo: true
  });

  const [errores, setErrores] = useState({});
  const diasSemana = [
    { id: 'LUNES', label: ' LUNES' },
    { id: 'MARTES', label: 'MARTES' },
    { id: 'MIERCOLES', label: 'MIERCOLES' },
    { id: 'JUEVES', label: 'JUEVES' },
    { id: 'VIERNES', label: 'VIERNES' },
    { id: 'SABADO', label: 'SABADO' },
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
        dias_promocion: diasPromocion,
        activo: promocion?.activo ?? true
      });
      setErrores({});
    }
  }, [promocion, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Convertir a mayúsculas los campos de texto (excepto números)
    if (type !== 'checkbox' && name !== 'precio_promocion') {
      finalValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
    
    // ============ VALIDACIÓN DE NOMBRE ============
    if (!formData.nombre_promocion.trim()) {
      nuevosErrores.nombre_promocion = 'El nombre es requerido';
    } else if (formData.nombre_promocion.trim().length < 3) {
      nuevosErrores.nombre_promocion = 'El nombre debe tener al menos 3 caracteres';
    } else {
      // 👇 VALIDACIÓN DE DUPLICADOS
      const nombreNormalizado = formData.nombre_promocion.trim().toUpperCase();
      const nombreDuplicado = promocionesExistentes.some(p => {
        // Si estamos editando, excluir la promoción actual de la comparación
        const esPromocionActual = promocion && 
          (p.id_promocion_pk === promocion.id_promocion_pk || 
           p.id === promocion.id);
        
        if (esPromocionActual) return false;
        
        // Comparar nombres normalizados
        return p.nombre_promocion.trim().toUpperCase() === nombreNormalizado;
      });

      if (nombreDuplicado) {
        nuevosErrores.nombre_promocion = 'Ya existe una promoción con este nombre';
      }
    }
    
    // ============ VALIDACIÓN DE DESCRIPCIÓN ============
    if (!formData.descripcion_promocion.trim()) {
      nuevosErrores.descripcion_promocion = 'La descripción es requerida';
    }
    // ============ VALIDACIÓN DE PRECIO ============
    const precio = parseFloat(formData.precio_promocion);
    if (!formData.precio_promocion || isNaN(precio)) {
      nuevosErrores.precio_promocion = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precio_promocion = 'El precio debe ser mayor a 0';
    } else if (precio > 10000) {
      nuevosErrores.precio_promocion = 'El precio parece demasiado alto (máx: L. 10,000)';
    }

    // ============ VALIDACIÓN DE DÍAS ============
    if (!formData.dias_promocion || formData.dias_promocion.length === 0) {
      nuevosErrores.dias_promocion = 'Debe seleccionar al menos un día de la semana';
    }
    
    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
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

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={handleClose} />
      <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
    </div>
  );

  if (!isOpen) return null;
  
  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">{promocion ? 'EDITAR PROMOCIÓN' : 'NUEVA PROMOCIÓN'}</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={handleClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="mt-2">
        {/* Formulario */}
        <div className="flex flex-col gap-3">
          {/* Nombre de la Promoción */}
          <span>
            <label htmlFor="nombre_promocion" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DE LA PROMOCIÓN</label>
            <InputText
              id="nombre_promocion"
              name="nombre_promocion"
              value={formData.nombre_promocion}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Ej: Promoción Baño + Corte"
            />
            {errores.nombre_promocion && <p className="text-xs text-red-600 mt-1">{errores.nombre_promocion}</p>}
          </span>

          {/* Descripción */}
          <span>
            <label htmlFor="descripcion_promocion" className="text-xs font-semibold text-gray-700 mb-1">DESCRIPCIÓN</label>
            <textarea 
              name="descripcion_promocion" 
              id="descripcion_promocion" 
              value={formData.descripcion_promocion} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-20 text-sm resize-none"
              placeholder="Descripción detallada de la promoción..." 
            />
            {errores.descripcion_promocion && <p className="text-xs text-red-600 mt-1">{errores.descripcion_promocion}</p>}
          </span>

          {/* Precio */}
          <span>
            <label htmlFor="precio_promocion" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
            <InputText
              id="precio_promocion"
              name="precio_promocion"
              value={formData.precio_promocion}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="0.00"
              keyfilter="num"
            />
            {errores.precio_promocion && <p className="text-xs text-red-600 mt-1">{errores.precio_promocion}</p>}
          </span>

          {/* Días de la Promoción */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1">DÍAS DE LA PROMOCIÓN</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {diasSemana.map(dia => (
                <div key={dia.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={dia.id}
                    checked={formData.dias_promocion.includes(dia.id)}
                    onChange={() => handleDiaToggle(dia.id)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label 
                    htmlFor={dia.id} 
                    className={`text-xs cursor-pointer select-none ${
                      formData.dias_promocion.includes(dia.id) 
                        ? 'font-semibold text-green-700' 
                        : 'font-normal text-gray-600'
                    }`}
                  >
                    {dia.label}
                  </label>
                </div>
              ))}
            </div>
            {errores.dias_promocion && <p className="text-xs text-red-600 mt-1">{errores.dias_promocion}</p>}
          </div>
        </div>


      </div>
    </Dialog>
  );
}