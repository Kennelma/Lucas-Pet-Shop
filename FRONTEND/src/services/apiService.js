import axios from "axios";

const API_URL = "http://localhost:4000/api";


{/*SERVICIO QUE CONSUME EL ENDPOINT DE GET */}
export const verRegistro = async (nombreTabla) => {
  try {
    const res = await axios.get(`${API_URL}/${nombreTabla}/ver`);
    return res.data.datos || [];
  } catch (err) {
    console.error(`Error al traer ${nombreTabla}:`, err);
    return [];
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE POST*/}
export const insertarRegistro = async (nombreTabla, datos) => {
  try {
    const res = await axios.post(`${API_URL}/${nombreTabla}/ingresar`, datos);
    return res.data;
  } catch (err) {
    console.error(`Error al insertar en ${nombreTabla}:`, err);
    return null;
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE PUT*/}
export const actualizarRegistro = async (nombreTabla, id, datos) => {
  try {
    const res = await axios.put(`${API_URL}/${nombreTabla}/${id}/actualizar`, datos);
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar ${nombreTabla} con ID ${id}:`, err);
    return null;
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE DELETE*/}
export const borrarRegistro = async (nombreTabla, id) => {
  try {
    const res = await axios.delete(`${API_URL}/${nombreTabla}/${id}/borrar`);
    return res.data;
  } catch (err) {
    console.error(`Error al borrar ${nombreTabla} con ID ${id}:`, err);
    return null;
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE INSERTAR ALIMENTO*/}
export const insertarProductoAlimento = async (datos) => {
  try {
    // Llamamos al endpoint específico de productos + alimentos
    const res = await axios.post(`${API_URL}/productos-alimentos`, datos);
    return res.data;
  } catch (err) {
    console.error("❌ Error al insertar producto + alimento:", err.response ? err.response.data : err);
    return null;
  }
};

export const obtenerProductosAlimentos = async () => {
  try {
    // Llamamos al endpoint GET
    const res = await axios.get(`${API_URL}/productos-alimentos`);
    return res.data; // contiene { mensaje, datos }
  } catch (err) {
    console.error(
      "❌ Error al obtener productos-alimentos:",
      err.response ? err.response.data : err
    );
    return null;
  }
};