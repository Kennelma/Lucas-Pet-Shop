import axios from "axios";

const API_URL = "http://localhost:4000/api/productos";

/*SERVICIO PARA VER PRODUCTOS POR TIPO*/
export const verProductos = async (tipo_producto) => {
  try {
    const res = await axios.get(`${API_URL}/ver`, {
      params: { tipo_producto } 
    });
    return res.data.productos || [];
  } catch (err) {
    console.error(`Error al traer productos:`, err);
    return [];
  }
};


//SERVICIO PARA INSERTAR PRODUCTO
export const insertarProducto = async (datosProducto) => {
  try {
    const res = await axios.post(`${API_URL}/insertar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al insertar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};



/*SERVICIO PARA ACTUALIZAR PRODUCTO*/
export const actualizarProducto = async (datosProducto) => {
  try {
    const res = await axios.put(`${API_URL}/actualizar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};

/*SERVICIO PARA ELIMINAR PRODUCTO*/
export const eliminarProducto = async (id_producto) => {
  try {
    const res = await axios.delete(`${API_URL}/eliminar`, {
      data: { id_producto }
    });
    return res.data;
  } catch (err) {
    console.error(`Error al eliminar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};


