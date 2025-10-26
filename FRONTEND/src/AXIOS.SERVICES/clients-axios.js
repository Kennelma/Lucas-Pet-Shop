import axiosInstance from './axiosConfig';

const API_URL = "/clientes";


//SERVICIO PARA VER CLIENTES
export const verClientes = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`);

    return res.data.clientes || [];

  } catch (err) {

    console.error('Error al traer clientes:', err);
    return [];
  }
};

//SERVICIO PARA INSERTAR CLIENTES
export const insertarCliente = async (datosCliente) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosCliente);

    return res.data;

  } catch (err) {
    console.error('Error al insertar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ACTUALIZAR CLIENTES
export const actualizarCliente = async (datosCliente) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizar`, datosCliente);
    return res.data;
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR CLIENTE
export const eliminarCliente = async (id) => { 
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id }
    });
    return res.data;
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};
