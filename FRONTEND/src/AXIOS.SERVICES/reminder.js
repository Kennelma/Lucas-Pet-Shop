import axiosInstance from './axiosConfig';


const API_URL = "/recordatorios";

// ───────────────────────────────────────────────
// SERVICIO PARA VER RECORDATORIOS
// ───────────────────────────────────────────────
export const verRecordatorios = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`);
    return res.data.recordatorios || [];
  } catch (err) {
    console.error("Error al traer recordatorios:", err);
    return [];
  }
};

// ───────────────────────────────────────────────
// SERVICIO PARA INSERTAR RECORDATORIO
// ───────────────────────────────────────────────
export const insertarRecordatorio = async (datosRecordatorio) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosRecordatorio);
    return res.data;
  } catch (err) {
    console.error("Error al insertar recordatorio:", err);
    return { Consulta: false, error: err.message };
  }
};

// ───────────────────────────────────────────────
// SERVICIO PARA ACTUALIZAR RECORDATORIO
// ───────────────────────────────────────────────
export const actualizarRecordatorio = async (datosRecordatorio) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizar`, datosRecordatorio);
    return res.data;
  } catch (err) {
    console.error("Error al actualizar recordatorio:", err);
    return { Consulta: false, error: err.message };
  }
};

// ───────────────────────────────────────────────
// SERVICIO PARA ELIMINAR RECORDATORIO
// ───────────────────────────────────────────────
export const eliminarRecordatorio = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id },
    });
    return res.data;
  } catch (err) {
    console.error("Error al eliminar recordatorio:", err);
    return { Consulta: false, error: err.message };
  }
};

/*SERVICIO PARA VER CATALOGOS POR TIPO*/
export const verCatalogo = async (tipo_catalogo) => {
  try {

    const res = await axiosInstance.get(`${API_URL}/verCatalogos`, {
      params: { tipo_catalogo },
    });
    
    console.log(`Respuesta ${tipo_catalogo}:`, res.data);
    return {
      Consulta: res.data.Consulta,
      servicios: res.data.Catalogo || []
    };

  } catch (err) {
    console.error(`Error al traer catálogo ${tipo_catalogo}:`, err);
    return { Consulta: false, error: err.message, servicios: [] }; 
  }
};
