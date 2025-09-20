import axios from "axios";

const API_URL = "http://localhost:4000/api";


{/*SERVICIO QUE CONSUME EL ENDPOINT DE GET */}
export const verRegistro = async (tabla) => {
  try {
    const res = await axios.get(`${API_URL}/ver-informacion/${tabla}`);
    return res.data.datos || [];
  } catch (err) {
    console.error(`Error al traer ${tabla}:`, err);
    return [];
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE POST*/}
export const insertarRegistro = async (tabla, datos) => {
  try {
    const res = await axios.post(`${API_URL}/ingresar-datos-formulario`, { tabla, ...datos });
    return res.data;
  } catch (err) {
    console.error(`Error al insertar en ${tabla}:`, err);
    return null;
  }
};


{/*SERVICIO QUE CONSUME EL ENDPOINT DE PUT*/}
export const actualizarRegistro = async (tabla, id, datos) => {
  try {
    const res = await axios.put(`${API_URL}/actualizar-datos`, { tabla, id, ...datos });
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar ${tabla} con ID ${id}:`, err);
    return null;
  }
};

{/*SERVICIO QUE CONSUME EL ENDPOINT DE DELETE*/}
export const borrarRegistro = async (tabla, id) => {
  try {
    const res = await axios.delete(`${API_URL}/borrar-registro/${tabla}/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error al borrar ${tabla} con ID ${id}:`, err);
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

// SERVICIO QUE CONSUME EL ENDPOINT DE GET TODOS LOS ALIMENTOS
export const verAlimentos = async () => {
  try {
    const res = await axios.get(`${API_URL}/alimentos/ver-todos`);
    // Devuelve solo el array de datos, igual que tu función verRegistro
    return res.data.datos || [];
  } catch (err) {
    console.error("❌ Error al traer los alimentos:", err);
    return [];
  }
};
