import axiosInstance from './axiosConfig';

const API_URL = "/empresa";


//SERVICIO PARA INSERTAR DATOS DEL MODULO DE EMPRESA
export const insertar = async (entidad, datos) => {
  try {

    const res = await axiosInstance.post(`${API_URL}/insertar`,
      { entidad,
        ...datos });
    return res.data;

  } catch (err) {

    const msg = err?.response?.data?.error || err.message || "Error de red";
    console.error(`Error al insertar ${entidad}:`, msg);
    return { Consulta: false, error: msg };
  }
};

// SERVICIO PARA VER DATOS DEL MODULO DE EMPRESA
export const ver = async (entidad) => {
  try {
    // Convierte a mayúsculas para evitar errores de case con el backend
    const entidadEnviada = entidad.toUpperCase();

    const res = await axiosInstance.get(`${API_URL}/ver`,
       { params: { entidad: entidadEnviada } }
    );

    if (res.data?.Consulta) {
      return res.data.entidad || [];
    } else {
        // Error de lógica de negocio (ej. "Entidad no permitida")
        console.error("Error en ver():", res.data?.error);
        return [];
    }

  } catch (err) {
    // Deja que el Interceptor de Axios maneje el 401 si el token expira
    console.error(`Error al traer ${entidad}:`, err);
    return [];
  }
};


// ─────────────────────────────────────────────
// ELIMINAR REGISTRO (EMPRESA, SUCURSAL, GASTO o USUARIO)
// ─────────────────────────────────────────────
export const eliminarRegistro = async (id, entidad) => {
  try {

    const response = await axiosInstance.delete(`${API_URL}/eliminar`, {
      data: { id, entidad },
    });

    return response.data;
  } catch (error) {
    console.error(`Error al eliminar ${entidad}:`, error);
    throw error;
  }
};


// ─────────────────────────────────────────────
//  ACTUALIZAR REGISTRO (EMPRESA, SUCURSAL, USUARIO o GASTO)
// ─────────────────────────────────────────────
export const actualizarRegistro = async (id, entidad, data = {}) => {
  try {
    const body = { id, entidad, ...data };

    const response = await axiosInstance.put(`${API_URL}/actualizar`, body);
    return response.data;

  } catch (error) {
    console.error(`Error al actualizar ${entidad}:`, error);
    throw error;
  }
};
