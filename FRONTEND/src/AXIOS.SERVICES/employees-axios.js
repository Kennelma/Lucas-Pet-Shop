import axiosInstance from './axiosConfig';


const API_URL = "/estilistas";


//SERVICIO PARA VER ESTILISTAS
export const verEstilistas = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`);
    return res.data.estilistas || [];
  } catch (err) {
    console.error('Error al traer estilistas:', err);
    return [];
  }
};

//SERVICIO PARA INSERTAR ESTILISTAS
export const insertarEstilista = async (datosEstilista) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosEstilista);
    return res.data;
  } catch (err) {
    console.error('Error al insertar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ACTUALIZAR ESTILISTAS
export const actualizarEstilista = async (datosEstilista) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizar`, datosEstilista);
    return res.data;
  } catch (err) {
    console.error('Error al actualizar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR ESTILISTA
export const eliminarEstilista = async (id) => { 
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id }
    });
    return res.data;
  } catch (err) {
    console.error('Error al eliminar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};
