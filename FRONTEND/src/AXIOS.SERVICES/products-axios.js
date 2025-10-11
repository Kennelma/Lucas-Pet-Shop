import axios from "axios";


export const API_BASE_URL = "http://localhost:4000";  // Sin /api/productos
export const API_URL = `${API_BASE_URL}/api/productos`;

;
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



//SERVICIO PARA INSERTAR PRODUCTO CON IMAGEN
export const insertarProducto = async (datosProducto, file = null) => {
  try {
    const formData = new FormData();
    
    // Agrega todos los campos del objeto al FormData
    Object.keys(datosProducto).forEach(key => {
      if (datosProducto[key] !== undefined && datosProducto[key] !== null) {
        formData.append(key, datosProducto[key]);
      }
    });
    
    // Agrega el archivo si existe
    if (file) {
      formData.append('imagen', file);
    }
    
    // 🔍 DEBUG: Verifica qué estás enviando
    console.log('📦 Datos a enviar:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }
     
    const res = await axios.post(`${API_URL}/insertar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Respuesta del servidor:', res.data);
    return res.data;
    
  } catch (err) {
    console.error('❌ Error al insertar producto:', err);
    console.error('Detalles del error:', err.response?.data);
    return { Consulta: false, error: err.message };
  }
};


/*SERVICIO PARA ACTUALIZAR PRODUCTO*/
export const actualizarProducto = async (datosProducto, file) => {
  try {
    const formData = new FormData();
    Object.keys(datosProducto).forEach(key => {
      formData.append(key, datosProducto[key]);
    });
    if (file) formData.append('imagen', file);

    const res = await axios.put(`${API_URL}/actualizar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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


