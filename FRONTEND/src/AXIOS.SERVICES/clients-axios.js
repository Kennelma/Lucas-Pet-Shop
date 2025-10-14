import axios from "axios";

const API_URL = "http://localhost:4000/api/clientes";


const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' 
    };
};


//SERVICIO PARA VER CLIENTES
export const verClientes = async () => {
  try {
    const res = await axios.get(`${API_URL}/ver`,
      { headers: getHeaders() }
    );
    return res.data.clientes || [];
  } catch (err) {
    console.error('Error al traer clientes:', err);
    return [];
  }
};

//SERVICIO PARA INSERTAR CLIENTES
export const insertarCliente = async (datosCliente) => {
  try {
    const res = await axios.post(`${API_URL}/insertar`, datosCliente, {
      headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Error al insertar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ACTUALIZAR CLIENTES
export const actualizarCliente = async (datosCliente) => {
  try {
    const res = await axios.put(`${API_URL}/actualizar`, datosCliente,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR CLIENTE
export const eliminarCliente = async (id) => { 
  try {
    const res = await axios.delete(`${API_URL}/eliminar`, {
      data: { id }, headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    return { Consulta: false, error: err.message };
  }
};
