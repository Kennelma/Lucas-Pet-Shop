const API_BASE_URL = 'http://localhost:4000/api';

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || `Error ${response.status}`);
  }
  return response.json();
};

// Función helper para hacer peticiones con configuración común
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return handleResponse(response);
};

export const serviciosService = {
  obtenerTodos: async () => {
    return apiRequest('/servicios_peluqueria_canina/ver');
  },

  crear: async (servicioData) => {
    const { nombre_servicio_peluqueria, descripcion_servicio } = servicioData;
    
    if (!nombre_servicio_peluqueria || !descripcion_servicio) {
      throw new Error('Todos los campos son requeridos');
    }

    const dataToSend = {
      nombre_servicio_peluqueria: nombre_servicio_peluqueria.trim(),
      descripcion_servicio: descripcion_servicio.trim()
    };

    return apiRequest('/servicios_peluqueria_canina/ingresar', {
      method: 'POST',
      body: JSON.stringify(dataToSend)
    });
  },

  actualizar: async (id, servicioData) => {
    const { nombre_servicio_peluqueria, descripcion_servicio } = servicioData;
    
    if (!nombre_servicio_peluqueria || !descripcion_servicio) {
      throw new Error('Todos los campos son requeridos');
    }

    const dataToSend = {
      nombre_servicio_peluqueria: nombre_servicio_peluqueria.trim(),
      descripcion_servicio: descripcion_servicio.trim()
    };

    return apiRequest(`/servicios_peluqueria_canina/${id}/actualizar`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend)
    });
  },

  eliminar: async (id) => {
    return apiRequest(`/servicios_peluqueria_canina/${id}/borrar`, {
      method: 'DELETE'
    });
  }
};