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
  if (!identidad) return [];
  try {
    const { data } = await axiosInstance.get(`${API_URL}/buscarCliente`, {
      params: { identidad },
    });

    const registros = Array.isArray(data?.data) ? data.data : [];
    return registros.map((r) => ({
      id: r.id_cliente_pk,
      identidad: r.identidad_cliente,
      nombre: r.nombre_cliente,
      apellido: r.apellido_cliente,
    }));
  } catch (err) {
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
};
