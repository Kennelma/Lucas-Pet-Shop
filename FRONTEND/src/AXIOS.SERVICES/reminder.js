import axios from "axios";

const API_URL = "http://localhost:4000/api/recordatorios";
const WHATSAPP_URL = "http://localhost:4000/api/whatsapp";

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
// SERVICIO PARA INSERTAR RECORDATORIO - CORREGIDO
// ───────────────────────────────────────────────
export const insertarRecordatorio = async (datosRecordatorio) => {
  try {
    // ✅ CORRECTO: Crear usa /crear
    const res = await axios.post(`${API_URL}/crear`, datosRecordatorio, {
      headers: getHeaders(),
    });
    
    return {
      Consulta: res.data.Consulta,
      mensaje: res.data.mensaje,
      id_recordatorio: res.data.id_recordatorio
    };
  } catch (err) {
    console.error("Error al insertar recordatorio:", err);
    return { Consulta: false, error: err.message };
  }
};

// ───────────────────────────────────────────────
// SERVICIO PARA ACTUALIZAR RECORDATORIO - CORREGIDO
// ───────────────────────────────────────────────
export const actualizarRecordatorio = async (datosRecordatorio) => {
  try {
    // ✅ CORREGIR: Actualizar usa /actualizar
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
// SERVICIO PARA ELIMINAR RECORDATORIO - CORREGIDO
// ───────────────────────────────────────────────
export const eliminarRecordatorio = async (id) => {
  try {
    // ✅ CORREGIR: Eliminar usa /eliminar
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
////////////////////////////////////////////////////
////////   SERVICIO PARA OBTENER QR ////////////////
////////////////////////////////////////////////////
export const obtenerQR = async () => {
  try {
    const res = await axios.get(`${WHATSAPP_URL}/qr-base64`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error al obtener QR:", err);
    return { Consulta: false, error: err.message };
  }
};


// ───────────────────────────────────────────────
// SERVICIO PARA VER CATALOGOS POR TIPO
// ───────────────────────────────────────────────

// ───────────────────────────────────────────────
// SERVICIO PARA VER CATALOGOS POR TIPO - CORREGIDO
// ───────────────────────────────────────────────
export const verCatalogo = async (tipo_catalogo) => {
  try {
    // ✅ CORRECTO: Catálogo usa /catalogo
    const res = await axios.get(`${API_URL}/catalogo`, {
      params: { tipo_catalogo },
      headers: getHeaders(),
    });
    
    console.log(`✅ Respuesta ${tipo_catalogo}:`, res.data);
    return {
      Consulta: res.data.Consulta,
      servicios: res.data.Catalogo || []
    };
  } catch (err) {
    console.error(`❌ Error al traer catálogo ${tipo_catalogo}:`, err);
    return { Consulta: false, error: err.message, servicios: [] }; 
  }
};
// ───────────────────────────────────────────────
// SERVICIOS DE WHATSAPP
// ───────────────────────────────────────────────
export const verificarEstadoWhatsApp = async () => {
  try {
    const res = await axios.get(`${WHATSAPP_URL}/status`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error al verificar estado de WhatsApp:", err);
    return { Consulta: false, connected: false };
  }
};

export const conectarWhatsApp = async () => {
  try {
    const res = await axios.post(`${WHATSAPP_URL}/connect`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error al conectar WhatsApp:", err);
    return { Consulta: false, error: err.message };
  }
};

export const desconectarWhatsApp = async () => {
  try {
    const res = await axios.post(`${WHATSAPP_URL}/disconnect`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("Error al desconectar WhatsApp:", err);
    return { Consulta: false, error: err.message };
  }
};

export const enviarRecordatorioMasivo = async (id_recordatorio, mensaje) => {
  try {
    const res = await axios.post(
      `${WHATSAPP_URL}/enviar-masivo`,
      { id_recordatorio, mensaje },
      { headers: getHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error("Error al enviar recordatorio masivo:", err);
    return { Consulta: false, error: err.message };
  }
};

// 🔹 TEMPORAL: Para evitar error de Facturacion.js
export const obtenerQRWhatsApp = async () => {
  console.warn('⚠️ obtenerQRWhatsApp está obsoleto. Usa obtenerQR en su lugar.');
  return await obtenerQR();
};