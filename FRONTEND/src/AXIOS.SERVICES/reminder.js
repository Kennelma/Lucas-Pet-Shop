import axios from "axios";

const API_URL = "http://localhost:4000/api/recordatorios";

const getHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

// ───────────────────────────────────────────────
// SERVICIO PARA VER RECORDATORIOS
// ───────────────────────────────────────────────
export const verRecordatorios = async () => {
  try {
    const res = await axios.get(`${API_URL}/ver`, {
      headers: getHeaders(),
    });
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
    const res = await axios.post(`${API_URL}/insertar`, datosRecordatorio, {
      headers: getHeaders(),
    });
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
    const res = await axios.put(`${API_URL}/actualizar`, datosRecordatorio, {
      headers: getHeaders(),
    });
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
    const res = await axios.delete(`${API_URL}/eliminar`, {
      data: { id },
      headers: getHeaders(),
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

    const res = await axios.get(`${API_URL}/verCatalogos`, {
      params: { tipo_catalogo },
      headers: getHeaders(),
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