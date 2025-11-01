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