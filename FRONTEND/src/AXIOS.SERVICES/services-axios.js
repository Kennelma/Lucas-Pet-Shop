import axios from "axios";

const API_URL = "http://localhost:4000/api/servicios-peluqueria";

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' 
    };
};


//VER SERVICIOS O PROMOCIONES
export const verServicios = async (tipo_servicio) => {
  try {
    const res = await axios.get(`${API_URL}/ver`, {
      params: { tipo_servicio }, headers: getHeaders()
    });
    return res.data.servicios || [];
  } catch (err) {
    console.error(`Error al traer servicios:`, err);
    return [];
  }
};

//INSERTAR SERVICIO O PROMOCIÓN
export const insertarServicio = async (datosServicio) => {
  try {
    const res = await axios.post(`${API_URL}/insertar`, datosServicio, 
      { headers: getHeaders() });
    return res.data;
  } catch (err) {
    console.error(`Error al insertar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};

//ACTUALIZAR SERVICIO O PROMOCIÓN */
export const actualizarServicio = async (datosServicio) => {
  try {
    const res = await axios.put(`${API_URL}/actualizar`, datosServicio, 
      { headers: getHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};

//ELIMINAR SERVICIO O PROMOCIÓN
export const eliminarServicio = async (id, tipo_servicio) => {
  try {
    const res = await axios.delete(`${API_URL}/eliminar`, {
      data: { id, tipo_servicio },
      headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    console.error(`Error al eliminar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};
