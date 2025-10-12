import axios from "axios";

const API_URL = "http://localhost:4000/api/empresa"; 


//SERVICIO PARA INSERTAR DATOS DEL MODULO DE EMPRESA
export const insertar = async (entidad, datos) => {
  try {

    const res = await axios.post(`${API_URL}/insertar`, 
      { entidad, 
        ...datos }); 
    return res.data; 

  } catch (err) {
    
    const msg = err?.response?.data?.error || err.message || "Error de red";
    console.error(`Error al insertar ${entidad}:`, msg);
    return { Consulta: false, error: msg };
  }
};


export const ver = async (entidad) => {
  try {
    const res = await axios.get(`${API_URL}/ver`, {
      params: { entidad } 
    });
    return res.data;
  } catch (err) {
    console.error(`Error al traer ${entidad}:`, err);
    return [];
  }
};