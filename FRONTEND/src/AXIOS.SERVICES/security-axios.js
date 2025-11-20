import axiosInstance from "./axiosConfig";

const API_URL = "/seguridad";


//SERVICIO PARA OBTENER EL CATÁLOGO DE ROLES DE USUARIOS
export const verRolesUsuarios = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/catalogoRoles`, {
      params: { opciones: 'ROLES' }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

//SERVICIO PARA OBTENER SUCURSALES
export const verSucursales = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/catalogoRoles`, {
      params: { opciones: 'SUCURSALES' }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

//SERVICIO PARA OBTENER ESTADOS DE USUARIOS
export const verEstadosUsuarios = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/catalogoRoles`, {
      params: { opciones: 'ESTADO' }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

//SERVICIO PARA CREAR USUARIO
export const crearUsuario = async (datosUsuario) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/crearUsuario`, datosUsuario);
    return res.data;
  } catch (error) {
    throw error;
  }
};


//SERVICIO PARA VER USUARIOS
export const verUsuarios = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/verUsuarios`);
    return res.data;
  } catch (error) {
    throw error;
  }
};


//SERVICIO PARA ACTUALIZAR USUARIO
export const actualizarUsuario = async (datosUsuario) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/actualizarUsuario`, datosUsuario);
    return res.data;
  } catch (error) {
    throw error;
  }
};


//SERVICIO PARA ELIMINAR USUARIO
export const eliminarUsuario = async (id_usuario_pk) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/eliminarUsuario`, {
      data: { id_usuario_pk }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};