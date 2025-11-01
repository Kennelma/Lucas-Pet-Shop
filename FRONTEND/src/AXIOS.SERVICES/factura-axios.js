import axiosInstance from "./axiosConfig";

const API_URL = "/facturacion";

//SERVICIO PARA CREAR FACTURA COMPLETA
export const crearFactura = async (datosFactura) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/crearFactura`, datosFactura);
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data?.error ||
      err.message ||
      "Error de red";
    console.error("Error al crear factura:", msg);

    return {
      success: false,
      mensaje: msg,
      error: err?.response?.data,
    };
  }
};

export const obtenerDetallesFactura = async (tipo_item) => {
  try {
    const { data } = await axiosInstance.get(
      `${API_URL}/detallesFactura`,
      { params: { tipo_item } }
    );
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data?.error ||
      err.message ||
      "Error al cargar el catálogo de ítems.";
    console.error("Error al cargar catálogo:", msg);
    return { success: false, mensaje: msg, error: err?.response?.data };
  }
};

export const buscarCliente = async (identidad) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/buscarCliente`, {
      params: { identidad },
    });
    return data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    console.error("Error al buscar cliente:", error);
    throw error;
  }
};


//SERVICIO PARA OBTENER USUARIO Y SUCURSAL
export const obtenerUsuarioFactura = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/usuarioFacturacion`);
    return data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener datos del usuario",
    };
  }
};


//SERVICIO PARA OBTENER ESTILSTAS
export const obtenerEstilistasFactura = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/estilistasFacturacion`);
    return data;
  } catch (error) {
    console.error("Error al obtener estilistas:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener datos de los estilistas",
    };
  }
};


//SERVICIO PARA OBTENER HISTORIAL DE FACTURAS
export const obtenerHistorialFacturas = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/verFacturas`);
    return data;
  } catch (error) {
    console.error("Error al obtener historial de facturas:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al obtener el historial de facturas",
      data: []
    };
  }
};
