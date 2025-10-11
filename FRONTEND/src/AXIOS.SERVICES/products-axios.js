import axios from "axios";


export const API_BASE_URL = "http://localhost:4000";  
export const API_URL = `${API_BASE_URL}/api/productos`;


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



// SERVICIO PARA INSERTAR PRODUCTO CON IMAGEN
export const insertarProducto = async (datosProducto, file) => {
  const formData = new FormData();
  for (const key in datosProducto) {
    formData.append(key, datosProducto[key]);
  }
  if (file) formData.append('imagen', file);

  const res = await axios.post(`${API_URL}/insertar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

//SERVICIO PARA ACTUALIZAR PRODUCTO
export const actualizarProducto = async (datosProducto, file) => {
  const formData = new FormData();
  for (const key in datosProducto) {
    formData.append(key, datosProducto[key]);
  }
  if (file) formData.append('imagen', file);

  const res = await axios.put(`${API_URL}/actualizar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
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


