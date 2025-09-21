import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

const ServiciosPeluqueria = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: '',
    id_categoria_item_fk: null
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/servicios_peluqueria_canina/ver`);
      const data = await response.json();
      setServicios(data.datos || []);
      setError('');
    } catch (error) {
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (servicio = null) => {
    if (servicio) {
      setFormData({
        ...servicio,
        id_categoria_item_fk: servicio.id_categoria_item_fk || null
      });
      setServicioEditando(servicio);
    } else {
      setFormData({
        nombre_servicio_peluqueria: '',
        descripcion_servicio: '',
        id_categoria_item_fk: null
      });
      setServicioEditando(null);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setServicioEditando(null);
    setError('');
    setMensaje('');
  };

  const guardarServicio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nombre_servicio_peluqueria || !formData.descripcion_servicio) {
        setError('Todos los campos son requeridos');
        setLoading(false);
        return;
      }

      // Preparar datos asegurando que id_categoria_item_fk sea null (no 'null')
      const dataToSend = {
        nombre_servicio_peluqueria: formData.nombre_servicio_peluqueria,
        descripcion_servicio: formData.descripcion_servicio,
        id_categoria_item_fk: null  // Siempre como null JavaScript
      };

      // Si estamos editando, incluir el ID
      if (servicioEditando) {
        dataToSend.id_servicio_peluqueria_pk = servicioEditando.id_servicio_peluqueria_pk;
      }

      const url = servicioEditando 
        ? `${API_BASE_URL}/servicios_peluqueria_canina/${servicioEditando.id_servicio_peluqueria_pk}/actualizar`
        : `${API_BASE_URL}/servicios_peluqueria_canina/ingresar`;
      
      const method = servicioEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setMensaje(servicioEditando ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente');
        await cargarServicios();
        setTimeout(cerrarModal, 1500);
      } else {
        const errorData = await response.json();
        setError('Error al guardar el servicio: ' + (errorData.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al guardar el servicio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarServicio = async (servicio) => {
    if (window.confirm(`¿Eliminar el servicio "${servicio.nombre_servicio_peluqueria}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/servicios_peluqueria_canina/${servicio.id_servicio_peluqueria_pk}/borrar`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await cargarServicios();
          setMensaje('Servicio eliminado exitosamente');
          setTimeout(() => setMensaje(''), 3000);
        } else {
          setError('Error al eliminar el servicio');
        }
      } catch (error) {
        setError('Error al eliminar el servicio');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Servicios de Peluquería</h1>
              <p className="text-gray-600">Gestiona los servicios de peluquería canina</p>
            </div>
            <button
              onClick={() => abrirModal()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Nuevo Servicio
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <strong>Éxito:</strong> {mensaje}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Cargando servicios...</p>
            </div>
          ) : servicios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No hay servicios registrados</p>
              <p className="text-sm">Haz clic en "Nuevo Servicio" para agregar el primero</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio) => (
                <div key={servicio.id_servicio_peluqueria_pk} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">{servicio.nombre_servicio_peluqueria}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{servicio.descripcion_servicio}</p>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => abrirModal(servicio)}
                      className="text-blue-600 hover:text-blue-900 font-medium text-sm transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => eliminarServicio(servicio)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button 
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div onSubmit={guardarServicio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.nombre_servicio_peluqueria}
                  onChange={(e) => setFormData({...formData, nombre_servicio_peluqueria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Baño completo con corte"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Servicio *
                </label>
                <textarea
                  value={formData.descripcion_servicio}
                  onChange={(e) => setFormData({...formData, descripcion_servicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descripción detallada del servicio"
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                  {mensaje}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarServicio}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : (servicioEditando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosPeluqueria;