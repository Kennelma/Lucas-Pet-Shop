import axiosInstance from './axiosConfig';

const API_URL = "/facturación"; 


// SERVICIO PARA CREAR FACTURA COMPLETA
export const crearFactura = async (datosFactura) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/crearFactura`, datosFactura);
    return res.data;
} catch (err) {

    const msg = err?.response?.data?.mensaje || err?.response?.data?.error || err.message || "Error de red";
    console.error('Error al crear factura:', msg);

    return { 
      success: false, 
      mensaje: msg,
      error: err?.response?.data 
    };
  }
};
