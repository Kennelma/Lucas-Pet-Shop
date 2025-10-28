import axiosInstance from "./axiosConfig";

const API_URL = "/facturacion";

// SERVICIO PARA CREAR FACTURA COMPLETA
export const crearFactura = async (datosFactura) => {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/crearFactura`,
      datosFactura
    );
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
      `${API_URL}/seleccionarDetallesFactura`,
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


export const buscarClientePorIdentidad = async (identidad) => {
  try {
    const { data } = await axiosInstance.get(
      `${API_URL}/seleccionarEncabezadoFactura`,
      {
          params: {
            identidad: identidad
          }
      }
    );
    return data;
  } catch (err) {
    return { success: false, mensaje: "Error al buscar cliente." };
  }
};

