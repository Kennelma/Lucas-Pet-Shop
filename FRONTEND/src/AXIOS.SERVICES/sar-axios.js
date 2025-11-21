import axiosInstance from "./axiosConfig";

const API_URL = "/sar";

//SERVICIO DE AXIOS QUE ME OBTIENE EL CATÁLOGO DE CAI
export const verCatalogoCAI = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/verCatalogo`);
        return res.data;
    } catch (error) {
        throw error;
    }
};


//SERVICIO DE AXIOS PARA CREAR UN NUEVO CAI
export const crearCAI = async (datosCAI) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/crear`, datosCAI);
        return res.data;
    } catch (error) {
        throw error;
    }
};


//SERVICIO DE AXIOS PARA OBTENER LAS ALERTAS DEL CAI ACTIVO
export const obtenerAlertasCAI = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/alertas`);
        return res.data;
    }
    catch (error) {
        throw error;
    }
};