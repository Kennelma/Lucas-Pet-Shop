import axiosInstance from './axiosConfig';

const API_URL = "/servicios-peluqueria";


//VER SERVICIOS O PROMOCIONES
export const verServicios = async (tipo_servicio) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`, {
      params: { tipo_servicio }
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
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosServicio);
    return res.data;
  } catch (err) {
    console.error(`Error al insertar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};

//ACTUALIZAR SERVICIO O PROMOCIÓN */
export const actualizarServicio = async (datosServicio) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizar`, datosServicio);
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};

//ELIMINAR SERVICIO O PROMOCIÓN
export const eliminarServicio = async (id, tipo_servicio) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id, tipo_servicio }
    });
    return res.data;
  } catch (err) {
    console.error(`Error al eliminar servicio:`, err);
    return { Consulta: false, error: err.message };
  }
};
//SERVICIOS FAVORITOS

export const verServiciosFavoritos = async () => {
  try {
    const res = await axiosInstance.get('/productos/favoritos', {
      params: { tipo: 'SERVICIOS' }
    });
    return res.data.favoritos || [];
  } catch (err) {
    console.error(`Error al traer servicios favoritos:`, err);
    return [];
  }
};
