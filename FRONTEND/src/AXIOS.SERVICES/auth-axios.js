import axios from 'axios';

const API_URL = "http://localhost:4000/api";

export const login = async ({ login, password }) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, { login, password });

    return data; //MENSAJES DEL BACKEND { success: true, token: '...'

  } catch (error) {

    //MANEJO DE ERRORES CONSISTENTE
    if (error.response && error.response.data) {
      return error.response.data;
    }

    //SI NO HAY DATA, DEVOLVEMOS UN MENSAJE GENERICO
    return { success: false, message: "ERROR AL OBTENER INFO DEL SERVIDOR" };
  }
};


//LLAMADA DEL ENDPOINT PARA SOLICITAR CODIGO RESETEO
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


//ENDPOINT PARA RESETEAR CONTRASEÑA.
export const resetearContrasena = async (idUsuario, codigoOTP, nuevaContrasena) => {
    try {
        // Usamos la ruta exacta: /api/resetear-contrasena
        const { data } = await axios.post(`${API_URL}/resetear-contrasena`, { 
            idUsuario, 
            codigoOTP, 
            nuevaContrasena 
        });

        return data; 

    } catch (error) {
        
        
        if (error.response && error.response.data) {
            return error.response.data; 
        }
        return { success: false, message: "ERROR AL RESETEAR CONTRASEÑA EN EL SERVIDOR" };
    }
};