import { useEffect, useState } from "react";
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ModalPromocion({ isOpen, onClose, onSubmit, promocion = null }) {
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
    { id: 'LUNES', label: 'LUNES' },
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{promocion ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
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
              <label htmlFor="nombre_promocion" className="block text-sm font-medium text-gray-700">
                Nombre de la Promoción <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nombre_promocion" 
                id="nombre_promocion" 
                value={formData.nombre_promocion} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.nombre_promocion ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Promoción Baño + Corte" 
              />
              {errores.nombre_promocion && <p className="text-sm text-red-600">{errores.nombre_promocion}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="descripcion_promocion" className="block text-sm font-medium text-gray-700">
                Descripción de la Promoción <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="descripcion_promocion" 
                id="descripcion_promocion" 
                value={formData.descripcion_promocion} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-24 ${errores.descripcion_promocion ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Descripción detallada de la promoción..." 
              />
              {errores.descripcion_promocion && <p className="text-sm text-red-600">{errores.descripcion_promocion}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="precio_promocion" className="block text-sm font-medium text-gray-700">
                Precio de la Promoción (L) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                step="0.01" 
                name="precio_promocion" 
                id="precio_promocion" 
                value={formData.precio_promocion} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.precio_promocion ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00" 
              />
              {errores.precio_promocion && <p className="text-sm text-red-600">{errores.precio_promocion}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Días de la Promoción <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {diasSemana.map(dia => (
                  <div key={dia.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={dia.id}
                      checked={formData.dias_promocion.includes(dia.id)}
                      onChange={() => handleDiaToggle(dia.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={dia.id} 
                      className={`text-sm cursor-pointer select-none ${
                        formData.dias_promocion.includes(dia.id) 
                          ? 'font-semibold text-blue-700' 
                          : 'font-normal text-gray-600'
                      }`}
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Seleccione los días de la semana en que estará disponible la promoción</p>
              {errores.dias_promocion && <p className="text-sm text-red-600">{errores.dias_promocion}</p>}
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
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                {promocion ? 'Actualizar' : 'Guardar'} Promoción
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}