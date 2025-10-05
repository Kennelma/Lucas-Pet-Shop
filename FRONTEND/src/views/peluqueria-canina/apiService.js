// Asegúrate de tener tu API_URL configurada
const API_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración

// ========== FUNCIONES PARA PROMOCIONES ==========

export const verPromociones = async () => {
  try {
    const response = await fetch(`${API_URL}/servicios?tipo_servicio=PROMOCIONES`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.Consulta ? data.servicios : [];
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    throw error;
  }
};

export const insertarPromocion = async (datos) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datos, tipo_servicio: 'PROMOCIONES' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al insertar promoción:', error);
    throw error;
  }
};

export const actualizarPromocion = async (id, datos) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...datos, tipo_servicio: 'PROMOCIONES' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    throw error;
  }
};

export const eliminarPromocion = async (id) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tipo_servicio: 'PROMOCIONES' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA SERVICIOS DE PELUQUERÍA ==========

export const verServiciosPeluqueria = async () => {
  try {
    const response = await fetch(`${API_URL}/servicios?tipo_servicio=PELUQUERIA`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.Consulta ? data.servicios : [];
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
};

export const insertarServicioPeluqueria = async (datos) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datos, tipo_servicio: 'PELUQUERIA' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al insertar servicio:', error);
    throw error;
  }
};

export const actualizarServicioPeluqueria = async (id, datos) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...datos, tipo_servicio: 'PELUQUERIA' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    throw error;
  }
};

export const eliminarServicioPeluqueria = async (id) => {
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tipo_servicio: 'PELUQUERIA' })
    });
    const data = await response.json();
    if (!data.Consulta) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    throw error;
  }
};