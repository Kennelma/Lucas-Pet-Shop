import { useEffect, useState } from "react";

export default function ClienteModal({ isOpen, onClose, onSubmit, cliente = null }) {
    

     const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    identidad: ''
  });


    useEffect(() => {
    setFormData({
        nombre: cliente?.nombre_cliente || '',
        telefono: cliente?.telefono_cliente || '',
        identidad: cliente?.identidad_cliente || ''
    });
    }, [cliente]);

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
    setFormData({ nombre: '', telefono: '', identidad: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-md max-h-full">
      
        <div className="relative bg-white rounded-lg shadow-lg">
          
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Cerrar modal</span>
            </button>
          </div>
          

          <div className="p-4 md:p-5">
            <div className="grid gap-4 mb-4">
              <div>
                <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-gray-900">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
                  placeholder="Ingrese el nombre completo"
                  required
                />
              </div>
              
              {/* Campo Teléfono */}
              <div>
                <label htmlFor="telefono" className="block mb-2 text-sm font-medium text-gray-900">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
                  placeholder="0000-0000"
                  required
                />
              </div>
              
              {/* Campo Número de Identidad */}
              <div>
                <label htmlFor="identidad" className="block mb-2 text-sm font-medium text-gray-900">
                  Número de Identidad
                </label>
                <input
                  type="text"
                  name="identidad"
                  id="identidad"
                  value={formData.identidad}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
                  placeholder="0000-0000-00000"
                  required
                />
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors flex-1"
              >
                <svg className="me-2 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                </svg>
                {cliente ? 'Actualizar' : 'Guardar'} Cliente
              </button>
              
              <button
                onClick={handleClose}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}