import axios from 'axios';

const API_URL = "http://localhost:4000/api";

export const login = async ({ login, password }) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, { login, password });
    return data; // { success, message, usuario, token }
  } catch (error) {
    // Si hay un error, devolvemos la data del error si existe
    if (error.response && error.response.data) {
      return error.response.data;
    }

    //SU NO HAY DATA, DEVOLVEMOS UN MENSAJE GENERICO
    return { success: false, message: "ERROR AL OBTENER INFO DEL SERVIDOR" };
  }
};

export const solicitarCodigoReset = async (email) => {
    try {
        // El endpoint completo es: /api/auth/solicitar-reset (basado en la configuración de rutas)
        // Adaptamos a '/solicitar-reset' si tu backend ya incluye '/auth' en el router principal
        const { data } = await axios.post(`${API_URL}/solicitar-reset`, { email });
        
        // El backend responde con { success: true, message: '...', idUsuario: X }
        return data; 

    } catch (error) {
        // Manejo de errores consistente
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { success: false, message: "ERROR AL SOLICITAR CÓDIGO DEL SERVIDOR" };
    }
};


//RUTA CONSUME ENDPOINT DE SOLICITAR CODIGO RESETEO
export const solicitarCodigoReseteo = async (email) => {
    try {

        const { data } = await axios.post(`${API_URL}/solicitar-reset`, { email });
        return data; 

    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { success: false, message: "ERROR AL SOLICITAR CÓDIGO DEL SERVIDOR" };
    }
};

// 3. ENDPOINT: POST /api/resetear-contrasena
// Llama a auth.resetearConCodigo para validar el OTP y actualizar la contraseña.
export const resetearContrasena = async (idUsuario, codigoOTP, nuevaContrasena) => {
    try {
        // Usamos la ruta exacta: /api/resetear-contrasena
        const { data } = await axios.post(`${API_URL}/resetear-contrasena`, { 
            idUsuario, 
            codigoOTP, 
            nuevaContrasena 
        });

        // El backend devuelve { success: true, message: 'Contraseña restablecida...' }
        return data; 

    } catch (error) {
        // Devuelve el error específico del backend (código incorrecto/expirado)
        if (error.response && error.response.data) {
            return error.response.data; 
        }
        return { success: false, message: "ERROR AL RESETEAR CONTRASEÑA EN EL SERVIDOR" };
    }
};