import axios from "axios";

const API_URL = "http://localhost:4000/api";

/*SERVICIO PARA VER PRODUCTOS POR TIPO*/
export const verProductos = async (tipo_producto) => {
  try {
    const res = await axios.get(`${API_URL}/productos/ver`, {
      params: { tipo_producto } 
    });
    return res.data.productos || [];
  } catch (err) {
    console.error(`Error al traer productos:`, err);
    return [];
  }
};


/*SERVICIO PARA INSERTAR PRODUCTO*/
export const insertarProducto = async (datosProducto) => {
  try {
    const res = await axios.post(`${API_URL}/productos/insertar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al insertar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};

/*SERVICIO PARA ACTUALIZAR PRODUCTO*/
export const actualizarProducto = async (datosProducto) => {
  try {
    const res = await axios.put(`${API_URL}/productos/actualizar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};


/*SERVICIO PARA ELIMINAR PRODUCTO*/
export const eliminarProducto = async (id_producto) => {
  try {
    const res = await axios.delete(`${API_URL}/productos/eliminar`, {
      data: { id_producto }
    });
    return res.data;
  } catch (err) {
    console.error(`Error al eliminar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};


{/*SERVICIO QUE CONSUME EL ENDPOINT DEL LOGIN*/}
export const loginUsuario = async (login, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { login, password });
    return res.data;
  } catch (err) {
    console.error('Error en login:', err);
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return null;
  }
};
