import axiosInstance from "./axiosConfig";

const API_URL = "/estilistas";

//SERVICIO PARA VER ESTILISTAS
export const verEstilistas = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`);
    return res.data.estilistas || [];
  } catch (err) {
    console.error("Error al traer estilistas:", err);
    return [];
  }
};

//SERVICIO PARA INSERTAR ESTILISTAS
export const insertarEstilista = async (datosEstilista) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosEstilista);
    return res.data;
  } catch (err) {
    console.error("Error al insertar estilista:", err);
    console.error("Error completo:", err.response?.data);
    console.error("Status:", err.response?.status);
    return { Consulta: false, error: err.response?.data?.error || err.message };
  }
};

//SERVICIO PARA ACTUALIZAR ESTILISTAS
export const actualizarEstilista = async (datosEstilista) => {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/actualizar`,
      datosEstilista
    );
    return res.data;
  } catch (err) {
    console.error("Error al actualizar estilista:", err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR ESTILISTA
export const eliminarEstilista = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id },
    });
    return res.data;
  } catch (err) {
    console.error("Error al eliminar estilista:", err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA VER BONIFICACIONES DE ESTILISTAS
export const verBonificacionesEstilistas = async (fecha_inicio, fecha_fin) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/bonificaciones`, {
      params: { fecha_inicio, fecha_fin }
    });

    if (res.data.Consulta) {
      return res.data.bonificaciones || [];
    } else {
      console.warn('Consulta fallida:', res.data.error);
      return [];
    }

  } catch (err) {
    console.error('Error al traer bonificaciones de estilistas:', err);
    return [];
  }
};
