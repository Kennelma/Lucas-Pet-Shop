import axiosInstance from './axiosConfig';

const API_URL = "/perfil";


//VER PERFIL DE USUARIO
export const verPerfil = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/ver`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//ACTUALIZAR PERFIL DE USUARIO
export const actualizarPerfil = async (datosPerfil) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/actualizar`, datosPerfil);
    return response.data;
  } catch (error) {
    throw error;
  }
};
    