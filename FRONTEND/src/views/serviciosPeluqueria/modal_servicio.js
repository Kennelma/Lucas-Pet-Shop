import { useEffect, useState } from "react";
import { ScissorsIcon } from '@heroicons/react/24/outline';
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function ModalServicio({ 
  isOpen, 
  onClose, 
  onSubmit, 
  servicio = null,
  serviciosExistentes = [] // 👈 NUEVO: Lista de servicios para validar duplicados
}) {
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
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Convertir a mayúsculas los campos de texto (excepto números)
    if (type !== 'checkbox' && name !== 'precio_servicio' && name !== 'duracion_estimada') {
      finalValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // ============ VALIDACIÓN DE NOMBRE ============
    if (!formData.nombre_servicio_peluqueria.trim()) {
      nuevosErrores.nombre_servicio_peluqueria = 'El nombre es requerido';
    } else if (formData.nombre_servicio_peluqueria.trim().length < 3) {
      nuevosErrores.nombre_servicio_peluqueria = 'El nombre debe tener al menos 3 caracteres';
    } else {
      // 👇 VALIDACIÓN DE DUPLICADOS
      const nombreNormalizado = formData.nombre_servicio_peluqueria.trim().toUpperCase();
      const nombreDuplicado = serviciosExistentes.some(s => {
        // Si estamos editando, excluir el servicio actual de la comparación
        const esServicioActual = servicio && 
          (s.id_servicio_peluqueria_pk === servicio.id_servicio_peluqueria_pk || 
           s.id === servicio.id);
        
        if (esServicioActual) return false;
        
        // Comparar nombres normalizados
        return s.nombre_servicio_peluqueria.trim().toUpperCase() === nombreNormalizado;
      });

      if (nombreDuplicado) {
        nuevosErrores.nombre_servicio_peluqueria = 'Ya existe un servicio con este nombre';
      }
    }

    // ============ VALIDACIÓN DE DESCRIPCIÓN ============
    if (!formData.descripcion_servicio.trim()) {
      nuevosErrores.descripcion_servicio = 'La descripción es requerida';
    }

    // ============ VALIDACIÓN DE PRECIO ============
    const precio = parseFloat(formData.precio_servicio);
    if (!formData.precio_servicio || isNaN(precio)) {
      nuevosErrores.precio_servicio = 'El precio es requerido';
    } else if (precio <= 0) {
      nuevosErrores.precio_servicio = 'El precio debe ser mayor a 0';
    } else if (precio > 10000) {
      nuevosErrores.precio_servicio = 'El precio parece demasiado alto (máx: L. 10,000)';
    }

    // ============ VALIDACIÓN DE DURACIÓN ============
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

  const handleSubmit = async (e) => {
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

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={handleClose} />
      <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">{servicio ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'}</div>}
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
        {/* Formulario */}
        <div className="flex flex-col gap-3">
          {/* Nombre del Servicio */}
          <span>
            <label htmlFor="nombre_servicio_peluqueria" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL SERVICIO</label>
            <InputText
              id="nombre_servicio_peluqueria"
              name="nombre_servicio_peluqueria"
              value={formData.nombre_servicio_peluqueria}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Ej: Baño completo"
            />
            {errores.nombre_servicio_peluqueria && <p className="text-xs text-red-600 mt-1">{errores.nombre_servicio_peluqueria}</p>}
          </span>

          {/* Descripción */}
          <span>
            <label htmlFor="descripcion_servicio" className="text-xs font-semibold text-gray-700 mb-1">DESCRIPCIÓN</label>
            <textarea 
              name="descripcion_servicio" 
              id="descripcion_servicio" 
              value={formData.descripcion_servicio} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-20 text-sm resize-none"
              placeholder="Descripción detallada del servicio..." 
            />
            {errores.descripcion_servicio && <p className="text-xs text-red-600 mt-1">{errores.descripcion_servicio}</p>}
          </span>

          {/* Precio */}
          <span>
            <label htmlFor="precio_servicio" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
            <InputText
              id="precio_servicio"
              name="precio_servicio"
              value={formData.precio_servicio}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="0.00"
              keyfilter="num"
            />
            {errores.precio_servicio && <p className="text-xs text-red-600 mt-1">{errores.precio_servicio}</p>}
          </span>

          {/* Duración */}
          <span>
            <label htmlFor="duracion_estimada" className="text-xs font-semibold text-gray-700 mb-1">DURACIÓN (MIN)</label>
            <InputText
              id="duracion_estimada"
              name="duracion_estimada"
              value={formData.duracion_estimada}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Ej: 30"
              keyfilter="int"
            />
            {errores.duracion_estimada && <p className="text-xs text-red-600 mt-1">{errores.duracion_estimada}</p>}
          </span>

          {/* Requisitos */}
          <span>
            <label htmlFor="requisitos" className="text-xs font-semibold text-gray-700 mb-1">REQUISITOS (OPCIONAL)</label>
            <InputText
              id="requisitos"
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Ej: Mascota vacunada, sin pulgas..."
            />
          </span>
        </div>
    </Dialog>
  );
}