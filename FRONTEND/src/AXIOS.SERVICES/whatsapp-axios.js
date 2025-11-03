import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const obtenerQR = async () => {
    try {
        const response = await axios.get(`${API_URL}/whatsapp/qr`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener QR:', error);
        return { success: false, mensaje: 'Error al obtener QR' };
    }
};

export const verificarEstado = async () => {
    try {
        const response = await axios.get(`${API_URL}/whatsapp/estado`);
        return response.data;
    } catch (error) {
        console.error('Error al verificar estado:', error);
        return { success: false, conectado: false };
    }
};

//====================SOLICITAR_CODIGO_EMPAREJAMIENTO====================
export const solicitarCodigoEmparejamiento = async (phoneNumber) => {
    try {
        const response = await axios.post(`${API_URL}/whatsapp/pairing`, { phoneNumber });
        return response.data;
    } catch (error) {
        console.error('Error al solicitar código:', error);
        return { success: false, mensaje: 'Error al solicitar código de emparejamiento' };
    }
};

//====================CERRAR_SESION_WHATSAPP====================
export const cerrarSesionWhatsApp = async () => {
    try {
        const response = await axios.post(`${API_URL}/whatsapp/logout`);
        return response.data;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return { success: false, mensaje: 'Error al cerrar sesión' };
    }
};