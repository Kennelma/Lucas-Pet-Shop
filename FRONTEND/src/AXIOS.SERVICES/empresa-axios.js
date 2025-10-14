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
    // Si la respuesta existe y es 401 (Unauthorized) o 403 (Forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Sesión caducada o inválida. Redirigiendo a login.');
        sessionStorage.clear();
        // Usamos window.location.href para forzar la navegación fuera del router,
        // asegurando la recarga y la limpieza completa de la sesión.
        window.location.href = '/login'; 
        
        // Lanzamos un error para detener la ejecución de la función de servicio
        throw new Error('Token expirado. Redirigiendo a login.');
    }
    // Re-lanza cualquier otro error (500, 400, etc.)
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


// AXIOS.SERVICES/products-axios.js
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
