import axiosInstance from "./axiosConfig";

const API_URL = "/facturacion";

//CREAR FACTURA SIN PAGO (ESTADO PENDIENTE)
export const crearFacturaSinPago = async (datosFactura) => {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/crearFacturaSinPago`,
      datosFactura
    );
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data?.error ||
      err.message ||
      "Error de red";
    console.error("Error al crear factura sin pago:", msg);
    return {
      success: false,
      mensaje: msg,
      error: err?.response?.data,
    };
  }
};

//CREAR FACTURA CON PAGO
export const crearFacturaConPago = async (datosFactura) => {
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
    console.error("Error al crear factura con pago:", msg);
    return {
      success: false,
      mensaje: msg,
      error: err?.response?.data,
    };
  }
};

//VALIDAR DISPONIBILIDAD DE ITEMS PARA FACTURAR
export const validarDisponibilidad = async (itemsFactura) => {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/validarDisponibilidad`,
      { items: itemsFactura }
    );
    return res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data?.error ||
      err.message ||
      "Error de red";
    console.error("Error al validar disponibilidad:", msg);
    return {
      success: false,
      mensaje: msg,
      error: err?.response?.data,
    };
  }
};













export const obtenerDetallesFactura = async (tipo_item) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/catalogoItems`, {
      params: { tipo_item },
    });
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
      mensaje:
        error?.response?.data?.mensaje || "Error al obtener datos del usuario",
    };
  }
};

//SERVICIO PARA OBTENER ESTILSTAS
export const obtenerEstilistasFactura = async () => {
  try {
    const { data } = await axiosInstance.get(
      `${API_URL}/estilistasFacturacion`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener estilistas:", error);
    return {
      success: false,
      mensaje:
        error?.response?.data?.mensaje ||
        "Error al obtener datos de los estilistas",
    };
  }
};

//SERVICIO PARA OBTENER HISTORIAL DE FACTURAS (TABLA, NO CONFUNDIR)
export const obtenerHistorialFacturas = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/verFacturas`);
    return data;
  } catch (error) {
    console.error("Error al obtener historial de facturas:", error);
    return {
      success: false,
      mensaje:
        error?.response?.data?.mensaje ||
        "Error al obtener el historial de facturas",
      data: [],
    };
  }
};

//SERVICIO PARA OBTENER DATOS DE FACTURA EN FORMATO PDF
export const obtenerDatosFacturaPDF = async (numero_factura) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/imprimirFactura`, {
      params: { numero_factura },
    });
    return data;
  } catch (error) {
    console.error("Error al obtener datos de factura:", error);
    return {
      success: false,
      mensaje:
        error?.response?.data?.mensaje ||
        "Error al obtener datos de la factura",
      data: null,
    };
  }
};

// SERVICIO CORREGIDO - OBTENER DETALLE DE FACTURA
export const obtenerDetalleFacturaSeleccionada = async (numFactura) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/verDetalleFactura`, {
      params: {
        numero_factura: numFactura,
      },
    });
    return data;
  } catch (error) {
    console.error("Error al obtener detalle de factura:", error);
    return {
      success: false,
      mensaje: "Error de conexión al cargar los datos",
      data: null,
    };
  }
};

//ENDPOINT DE BORRA FACTURAS
export const borrarFactura = async (numero_factura) => {
  try {
    const { data } = await axiosInstance.delete(`${API_URL}/borrarFactura`, {
      params: { numero_factura }
    });

    return data;

  } catch (error) {
    console.error("Error al borrar factura:", error);
    return {
      success: false,
      mensaje: error?.response?.data?.mensaje || "Error al borrar la factura",
    };
  }
};
