import axios from "axios";

const API_URL = "http://localhost:4000/api/estilistas";

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' 
    };
};


//SERVICIO PARA VER ESTILISTAS
export const verEstilistas = async () => {
  try {
    const res = await axios.get(`${API_URL}/ver`,
      { headers: getHeaders() }
    );
    return res.data.estilistas || [];
  } catch (err) {
    console.error('Error al traer estilistas:', err);
    return [];
  }
};

//SERVICIO PARA INSERTAR ESTILISTAS
export const insertarEstilista = async (datosEstilista) => {
  try {
    const res = await axios.post(`${API_URL}/insertar`, datosEstilista, {
      headers: getHeaders()
    });

    return res.data;
  } catch (err) {
    console.error('Error al insertar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};


//SERVICIO PARA ACTUALIZAR ESTILISTAS
export const actualizarEstilista = async (datosEstilista) => {
  try {
    const res = await axios.put(`${API_URL}/actualizar`, datosEstilista,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error('Error al actualizar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR ESTILISTA
export const eliminarEstilista = async (id) => { 
  try {
    const res = await axios.delete(`${API_URL}/eliminar`, {
      data: { id }, headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    console.error('Error al eliminar estilista:', err);
    return { Consulta: false, error: err.message };
  }
};
