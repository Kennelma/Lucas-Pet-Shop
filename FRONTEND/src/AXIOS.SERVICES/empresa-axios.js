import axios from "axios";

const API_URL = "http://localhost:4000/api/empresa"; 



//FUNCION HELPER PARA OBTENER HEADERS CON TOKEN
const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' 
    };
};


const handleApiError = (error) => {

    if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Sesión caducada o inválida. Redirigiendo a login.');
        sessionStorage.clear();
        // Usamos window.location.href para forzar la navegación fuera del router,
        // asegurando la recarga y la limpieza completa de la sesión.
        window.location.href = '/login'; 
        
        //Lanzamos un error para detener la ejecución de la función de servicio
        throw new Error('Token expirado. Redirigiendo a login.');
    }
    //Re-lanza cualquier otro error (500, 400, etc.)
    throw error; 
};


//SERVICIO PARA INSERTAR DATOS DEL MODULO DE EMPRESA
export const insertar = async (entidad, datos) => {
  try {

    const res = await axios.post(`${API_URL}/insertar`, 
      { entidad, 
        ...datos },
      { headers: 
        getHeaders() }); 
    return res.data; 

  } catch (err) {
    
    const msg = err?.response?.data?.error || err.message || "Error de red";
    console.error(`Error al insertar ${entidad}:`, msg);
    return { Consulta: false, error: msg };
  }
};


//SERVICIO PARA VER DATOS DEL MODULO DE EMPRESA
export const ver = async (entidad) => {
  try {
    const res = await axios.get(`${API_URL}/ver`,
       { params: { entidad },
        headers: getHeaders()
     });
    if (res.data?.Consulta) {
      return res.data.entidad || [];
    } else {
      console.error("Error en ver():", res.data?.error);
      return [];
    }
  } catch (err) {
     try {
            // ⬅️ Manejar Error 401/403
            handleApiError(err);
        } catch (redirectError) {
            return { Consulta: false, error: redirectError.message };
        }

    console.error(`Error al traer ${entidad}:`, err);
    return [];
  }
};


// ─────────────────────────────────────────────
// ❌ ELIMINAR REGISTRO (EMPRESA, SUCURSAL, GASTO o USUARIO)
// ─────────────────────────────────────────────
export const eliminarRegistro = async (id, entidad) => {
  try {
    const response = await axios.delete(`${API_URL}/eliminar`, {
      data: { id, entidad },
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`Error al eliminar ${entidad}:`, error);
    throw error;
  }
};


// ─────────────────────────────────────────────
// ✏️ ACTUALIZAR REGISTRO (EMPRESA, SUCURSAL, USUARIO o GASTO)
// ─────────────────────────────────────────────
export const actualizarRegistro = async (id, entidad, data = {}) => {
  try {
    const body = { id, entidad, ...data };

    const response = await axios.put(`${API_URL}/actualizar`, body, {
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`Error al actualizar ${entidad}:`, error);
    throw error;
  }
};