// src/AXIOS.SERVICES/notificaciones-axios.js
import axiosInstance from "./axiosConfig";

const API_URL = "/notificaciones";

//====================OBTENER_NOTIFICACIONES====================
export const obtenerNotificaciones = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/ver`);
    return data;
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return {
      Consulta: false,
      mensaje: error?.response?.data?.error || "Error al obtener notificaciones",
      notificaciones: [],
    };
  }
};

//====================MARCAR_NOTIFICACIÓN_COMO_LEÍDA====================
export const marcarNotificacionLeida = async (id_notificacion_pk) => {
  try {
    const { data } = await axiosInstance.put(`${API_URL}/marcarLeida`, {
      id_notificacion_pk,
    });
    return data;
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return {
      Consulta: false,
      mensaje:
        error?.response?.data?.mensaje ||
        "Error al marcar notificación como leída",
    };
  }
};
