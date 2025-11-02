import axiosInstance from "./axiosConfig";

const API_URL = "/pagos";


//====================CATALOGO_METODOS_PAGO================
export const obtenerMetodoPago = async (metodoPago) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/metodosPago`, {
      params: { metodoPago }
    });
    return data;
  } catch (error) {
    console.error("Error al obtener método de pago:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener método de pago",
      data: []
    };
  }
};


//====================CATALOGO_TIPOS_PAGO====================
export const obtenerTiposPago = async (tipoPago) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/tipoPago`, {
      params: { tipoPago }
    });
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

