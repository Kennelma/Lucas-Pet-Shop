import axiosInstance from "./axiosConfig";

const API_URL = "/pagos";

//====================PROCESAR_PAGO====================
export const procesarPago = async (datosPago) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/procesarPago`, datosPago);
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data?.error ||
      err.message ||
      "Error al procesar el pago";
    console.error("Error al procesar pago:", msg);

    return {
      success: false,
      mensaje: msg,
      error: err?.response?.data,
    };
  }
};

//====================VER_PAGOS_DE_FACTURA====================
export const obtenerPagosFactura = async (numero_factura) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/ver`, {
      params: { numero_factura }
    });
    return data;
  } catch (error) {
    console.error("Error al obtener pagos de la factura:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener los pagos",
      data: []
    };
  }
};

//====================CATALOGO_METODOS_PAGO====================
export const obtenerMetodosPago = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/catalogoMetodosPago`);
    return data;
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener métodos de pago",
      data: []
    };
  }
};

