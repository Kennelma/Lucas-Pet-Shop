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

export const promocionesService = {
  /**
   * Obtiene todas las promociones
   */
  obtenerTodos: async () => {
    return apiRequest('/promociones/ver');
  },

  /**
   * Obtiene una promoción por ID
   */
  obtenerPorId: async (id) => {
    return apiRequest(`/promociones/${id}`);
  },

  /**
   * Crea una nueva promoción
   */
  crear: async (promocionData) => {
    // Validar datos antes de enviar
    const { nombre_promocion, descripcion_promocion, precio_promocion, dias_promocion } = promocionData;
    
    if (!nombre_promocion || !descripcion_promocion || !precio_promocion || !dias_promocion) {
      throw new Error('Todos los campos son requeridos');
    }

    const precio = parseFloat(precio_promocion);
    const dias = parseInt(dias_promocion);

    if (isNaN(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número válido mayor a 0');
    }

    if (isNaN(dias) || dias <= 0) {
      throw new Error('Los días deben ser un número válido mayor a 0');
    }

    const dataToSend = {
      nombre_promocion: nombre_promocion.trim(),
      descripcion_promocion: descripcion_promocion.trim(),
      precio_promocion: precio,
      dias_promocion: dias
    };

    return apiRequest('/promociones/ingresar', {
      method: 'POST',
      body: JSON.stringify(dataToSend)
    });
  },

  /**
   * Actualiza una promoción existente
   */
  actualizar: async (id, promocionData) => {
    const { nombre_promocion, descripcion_promocion, precio_promocion, dias_promocion } = promocionData;
    
    if (!nombre_promocion || !descripcion_promocion || !precio_promocion || !dias_promocion) {
      throw new Error('Todos los campos son requeridos');
    }

    const precio = parseFloat(precio_promocion);
    const dias = parseInt(dias_promocion);

    if (isNaN(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número válido mayor a 0');
    }

    if (isNaN(dias) || dias <= 0) {
      throw new Error('Los días deben ser un número válido mayor a 0');
    }

    const dataToSend = {
      nombre_promocion: nombre_promocion.trim(),
      descripcion_promocion: descripcion_promocion.trim(),
      precio_promocion: precio,
      dias_promocion: dias
    };

    return apiRequest(`/promociones/${id}/actualizar`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend)
    });
  },

  /**
   * Elimina una promoción
   */
  eliminar: async (id) => {
    return apiRequest(`/promociones/${id}/borrar`, {
      method: 'DELETE'
    });
  }
};