import axiosInstance from './axiosConfig';

const API_URL = "/productos";


//SERVICIO PARA VER PRODUCTOS POR TIPO*/
export const verProductos = async (tipo_producto) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ver`, {
      params: { tipo_producto }
    });
    return res.data.productos || [];
  } catch (err) {
    console.error(`Error al traer productos:`, err);
    return [];
  }
};


// ✅ NUEVA FUNCIÓN PARA FACTURACIÓN - TRAE TODOS LOS PRODUCTOS ACTIVOS
export const verProductosDisponibles = async () => {
  try {
    // Traer todos los tipos de productos (los 4 tipos)
    const [alimentos, accesorios, medicamentos, animales] = await Promise.all([
      verProductos('ALIMENTOS'),
      verProductos('ACCESORIOS'),
      verProductos('MEDICAMENTOS'),
      verProductos('ANIMALES')  // ⬅️ Agregar este
    ]);
    
    // Combinar todos y filtrar solo los activos con stock
    const todosProductos = [...alimentos, ...accesorios, ...medicamentos, ...animales]; // ⬅️ Agregar animales aquí también
    
    // Filtrar solo productos activos y con stock disponible
    const productosDisponibles = todosProductos.filter(p => 
      (p.activo === 1 || p.activo === "1") && 
      parseInt(p.stock || 0) > 0
    );
    
    return productosDisponibles;
  } catch (err) {
    console.error('Error al traer productos disponibles:', err);
    return [];
  }
};



//SERVICIO PARA INSERTAR PRODUCTO
export const insertarProducto = async (datosProducto) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/insertar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al insertar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};



//SERVICIO PARA ACTUALIZAR PRODUCTO*/
export const actualizarProducto = async (datosProducto) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizar`, datosProducto);
    return res.data;
  } catch (err) {
    console.error(`Error al actualizar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};

//SERVICIO PARA ELIMINAR PRODUCTO*/
export const eliminarProducto = async (id_producto) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id_producto }
    });
    return res.data;
  } catch (err) {
    console.error(`Error al eliminar producto:`, err);
    return { Consulta: false, error: err.message };
  }
};
