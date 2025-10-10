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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ScissorsIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nombre_servicio_peluqueria" className="block text-sm font-medium text-gray-700">
                Nombre del Servicio <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nombre_servicio_peluqueria" 
                id="nombre_servicio_peluqueria" 
                value={formData.nombre_servicio_peluqueria} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errores.nombre_servicio_peluqueria ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Baño completo con corte" 
              />
              {errores.nombre_servicio_peluqueria && <p className="text-sm text-red-600">{errores.nombre_servicio_peluqueria}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="descripcion_servicio" className="block text-sm font-medium text-gray-700">
                Descripción del Servicio <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="descripcion_servicio" 
                id="descripcion_servicio" 
                value={formData.descripcion_servicio} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-24 ${errores.descripcion_servicio ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Descripción detallada del servicio..." 
              />
              {errores.descripcion_servicio && <p className="text-sm text-red-600">{errores.descripcion_servicio}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="precio_servicio" className="block text-sm font-medium text-gray-700">
                  Precio del Servicio (L) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="precio_servicio" 
                  id="precio_servicio" 
                  value={formData.precio_servicio} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errores.precio_servicio ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00" 
                />
                {errores.precio_servicio && <p className="text-sm text-red-600">{errores.precio_servicio}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700">
                  Duración (minutos) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="duracion_estimada" 
                  id="duracion_estimada" 
                  value={formData.duracion_estimada} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errores.duracion_estimada ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej: 60" 
                />
                <p className="text-xs text-gray-500">Tiempo aproximado (mín: 5, máx: 480)</p>
                {errores.duracion_estimada && <p className="text-sm text-red-600">{errores.duracion_estimada}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700">
                Requisitos del Servicio
              </label>
              <textarea 
                name="requisitos" 
                id="requisitos" 
                value={formData.requisitos} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-20"
                placeholder="Ej: Mascota vacunada, sin pulgas, temperamento tranquilo..." 
              />
              <p className="text-xs text-gray-500">Requisitos o condiciones para el servicio (opcional)</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={handleClose} 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
              >
                {servicio ? 'Actualizar' : 'Guardar'} Servicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}