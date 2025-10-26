import axiosInstance from './axiosConfig';

export const login = async ({ login, password }) => {
  try {
    const { data } = await axiosInstance.post(`/login`, { login, password });

    return data; 

  } catch (error) {

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return { success: false, message: "ERROR AL OBTENER INFO DEL SERVIDOR" };
  }
};

// LLAMADA DEL ENDPOINT PARA SOLICITAR CODIGO RESETEO
export const solicitarCodigoReseteo = async (email) => {
  try {
    const { data } = await axiosInstance.post(`/solicitar-reset`, { email });
    return data;

  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: "ERROR AL SOLICITAR CÓDIGO DEL SERVIDOR" };
  }
};


// ENDPOINT PARA RESETEAR CONTRASEÑA
export const resetearContrasena = async (idUsuario, codigoOTP, nuevaContrasena) => {
  try {
    const { data } = await axiosInstance.post(`/resetear-contrasena`, {
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