import axiosInstance from "./axiosConfig";

const API_URL = "/pagos";




//====================CATALOGO_TIPOS_PAGO====================
export const obtenerTiposPago = async (tipoPago) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/tipoPago`);
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de pago:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener tipos de pago",
      data: []
    };
  }
};


//====================OBTENER TODOS LOS MÉTODOS DE PAGO================
export const obtenerTodosMetodosPago = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/metodosPago`);
    return data;
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.message || error?.response?.data?.error || "Error al obtener métodos de pago",
      data: []
    };
  }
};


//====================PROCESAR PAGO====================
export const procesarPago = async (datosPago) => {
  try {
    const { data } = await axiosInstance.post(`${API_URL}/procesarPago`, datosPago);
    return data;
  } catch (error) {
    console.error("Error al procesar pago:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || error?.response?.data?.error || "Error al procesar pago",
      data: null
    };
  }
};