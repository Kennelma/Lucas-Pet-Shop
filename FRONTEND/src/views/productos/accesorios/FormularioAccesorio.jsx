import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FormularioAccesorio = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Collar',
    cantidad: 0,
    precio: 0,
    imagen: null,
    imagenUrl: '',
    tipoImagen: 'none'
  });

  const [errors, setErrors] = useState({});

  const categorias = [
    'Collar',
    'Correa', 
    'Juguete',
    'Cama',
    'Comedero',
    'Transportadora',
    'Higiene',
    'Ropa'
  ];

  // Función para convertir archivo a Base64 (solo para preview local)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Configuración de react-dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const base64String = await convertToBase64(file);
        setFormData(prev => ({
          ...prev,
          imagen: file,
          imagenUrl: base64String,
          tipoImagen: 'local'
        }));
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  // Inicializar formulario
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          nombre: editData.nombre || '',
          categoria: editData.categoria || 'Collar',
          cantidad: editData.cantidad || 0,
          precio: editData.precio || 0,
          imagen: null,
          imagenUrl: editData.imagenUrl || '',
          tipoImagen: editData.tipoImagen || (editData.imagenUrl ? 'local' : 'none')
        });
      } else {
        setFormData({
          nombre: '',
          categoria: 'Collar',
          cantidad: 0,
          precio: 0,
          imagen: null,
          imagenUrl: '',
          tipoImagen: 'none'
        });
      }
      setErrors({});
    }
  }, [isOpen, editData]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del accesorio es obligatorio';
    }

    if (formData.cantidad < 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser un valor positivo';
    }

    if (formData.precio < 0) {
      nuevosErrores.precio = 'El precio debe ser un valor positivo';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      const datosParaGuardar = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        cantidad: formData.cantidad,
        precio: formData.precio,
        imagenUrl: formData.imagenUrl,
        tipoImagen: formData.tipoImagen
      };
      
      console.log('📤 Enviando datos al componente padre:', datosParaGuardar);
      
      const success = await onSave(datosParaGuardar);
      if (success !== false) {
        onClose();
      }
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      categoria: 'Collar',
      cantidad: 0,
      precio: 0,
      imagen: null,
      imagenUrl: '',
      tipoImagen: 'none'
    });
    setErrors({});
    onClose();
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null,
      imagenUrl: '',
      tipoImagen: 'none'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black bg-opacity-50">
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        marginLeft: 'var(--cui-sidebar-occupy-start, 0px)',
        marginRight: 'var(--cui-sidebar-occupy-end, 0px)'
      }}>
        <div className="rounded-lg w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden bg-white border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <span>🛍️</span>
            {editData ? 'Editar Accesorio' : 'Agregar Accesorio'}
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl font-bold transition-colors duration-200 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex overflow-hidden max-h-[calc(90vh-80px)]">
          {/* Panel Izquierdo - Formulario */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <div className="space-y-4">
              {/* Tipo de Categoría */}
              <div>
                <label className="block mb-1 font-semibold text-sm text-gray-700">
                  Tipo de Categoría:
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  disabled={!!editData}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    editData 
                      ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block mb-1 font-semibold text-sm text-gray-700">
                  Nombre y descripcion:
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300 bg-white text-gray-900 placeholder-gray-500 ${
                    errors.nombre ? 'border-red-500' : ''
                  }`}
                />
                {errors.nombre && (
                  <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>
                )}
              </div>

              {/* Stock y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-sm text-gray-700">
                    Stock:
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300 bg-white text-gray-900 ${
                      errors.cantidad ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.cantidad && (
                    <div className="text-red-500 text-xs mt-1">{errors.cantidad}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-sm text-gray-700">
                    Precio (L.):
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300 bg-white text-gray-900 ${
                      errors.precio ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.precio && (
                    <div className="text-red-500 text-xs mt-1">{errors.precio}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-300 justify-center">
              <button
                type="submit"
                className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-100 border-2 border-green-400 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3-3-3m3-3v12" />
                  </svg>
                </div>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-12 h-12 bg-red-100 border-2 border-red-400 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Panel Derecho - Imagen */}
          <div className="w-72 border-l p-4 overflow-y-auto border-gray-200 bg-gray-50">
            <div className="space-y-4">
              {/* Área de imagen */}
              <div className="space-y-3">
                {/* Mostrar imagen solo si existe */}
                {formData.imagenUrl ? (
                  <div className="relative">
                    <img
                      src={formData.imagenUrl}
                      alt="Accesorio"
                      className="w-full h-48 object-cover bg-white border rounded-lg"
                    />
                  </div>
                ) : (
                  /* Área placeholder cuando no hay imagen */
                  <div 
                    {...getRootProps()}
                    className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-purple-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm font-medium mb-1 text-gray-600">
                        {isDragActive ? 'Suelta la imagen aquí' : 'Agregar imagen'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Arrastra una imagen o haz click
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de imagen */}
                <div className="flex justify-center gap-4">
                  <div
                    {...getRootProps()}
                    className="cursor-pointer text-2xl hover:scale-110 transition-transform duration-200"
                  >
                    <input {...getInputProps()} />
                    📁
                  </div>
                  
                  {/* Eliminar */}
                  <div
                    onClick={removeImage}
                    className="cursor-pointer text-2xl hover:scale-110 transition-transform duration-200"
                  >
                    🗑️
                  </div>
                </div>

                {/* Área de drag & drop alternativa (solo si hay imagen) */}
                {formData.imagenUrl && (
                  <div
                    {...getRootProps()}
                    className={`w-full h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-purple-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <div className="text-lg mb-1">📷</div>
                      <div className="text-xs text-gray-600">
                        {isDragActive ? 'Suelta aquí' : 'Cambiar imagen'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioAccesorio;